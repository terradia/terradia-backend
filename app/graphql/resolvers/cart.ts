import UserModel from "../../database/models/user.model";
import { ApolloError } from "apollo-server";
import CartModel from "../../database/models/cart.model";
import CustomerModel from "../../database/models/customer.model";
import CartProductModel from "../../database/models/cart-product.model";
import ProductModel from "../../database/models/product.model";
import { combineResolvers } from "graphql-resolvers";
import {
  isAuthenticated,
  isUserAndCustomer,
  isUserAndStripeCustomer
} from "./authorization";
import CompanyModel from "../../database/models/company.model";
import OrderModel from "../../database/models/order.model";
import OrderProductModel from "../../database/models/order-product.model";
import { OrderIncludes } from "./order";
import UnitModel from "../../database/models/unit.model";
import Stripe from "stripe";
import CompanyImageModel from "../../database/models/company-image.model";
import ProductCompanyImageModel from "../../database/models/product-company-images.model";

const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: "2020-03-02"
});
declare interface UserCompanyRoleProps {
  companyUserId: string;
  roleId: string;
}

interface Context {
  user: UserModel;
}

export default {
  Query: {
    getCart: combineResolvers(
      isUserAndCustomer,
      async (_: any, __: any, { user }: Context): Promise<CartModel | null> => {
        const customer: CustomerModel = user.customer;
        if (!customer) {
          throw new ApolloError("this user is not a customer", "400");
        }
        if (customer.cart === null) {
          throw new ApolloError("this customer does not have a cart", "400");
        }
        return CartModel.findOne({
          where: {
            customerId: user.customer.id
          },
          include: [
            CompanyModel,
            {
              model: CartProductModel,
              separate: true,
              order: [["createdAt", "DESC"]],
              include: [
                {
                  model: ProductModel,
                  include: [
                    UnitModel,
                    {
                      model: ProductCompanyImageModel,
                      as: "cover",
                      include: [CompanyImageModel]
                    }
                  ]
                }
              ]
            }
          ]
        });
      }
    ),

    getCartsByCompany: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        { companyId }: { companyId: string }
      ): Promise<CartModel[] | null> => {
        return CartModel.findAll({
          where: {
            companyId
          },
          include: [
            CompanyModel,
            {
              model: CartProductModel,
              include: [ProductModel],
              order: ["updatedAt"]
            }
          ]
        });
      }
    ),
    totalCartPrice: combineResolvers(
      isUserAndCustomer,
      async (_: any, __: any, { user }: Context): Promise<number> => {
        const customer: CustomerModel = user.customer;
        if (!customer) {
          throw new ApolloError("this user is not a customer", "400");
        }
        if (customer.cart === null) {
          throw new ApolloError("this customer does not have a cart", "400");
        }
        const cart = await CartModel.findOne({
          where: {
            customerId: user.customer.id
          },
          include: [
            CompanyModel,
            {
              model: CartProductModel
            }
          ]
        });
        const deliveryPrice = 10;
        return cart ? cart.totalPrice + deliveryPrice : 0;
      }
    )
  },
  Mutation: {
    addProductToCart: combineResolvers(
      isUserAndCustomer,
      async (
        _: any,
        { productId, quantity }: { productId: string; quantity: number },
        { user }: Context
      ): Promise<CartProductModel> => {
        const customer: CustomerModel | null = user.customer;
        const product: ProductModel | null = await ProductModel.findOne({
          where: { id: productId }
        });
        if (!product)
          throw new ApolloError(
            "Cannot find this product",
            "RESOURCE_NOT_FOUND"
          );
        if (!customer)
          throw new ApolloError("This user is not a customer", "400");
        if (quantity < 0)
          throw new ApolloError(
            "You should add products, not remove them ;)",
            "400"
          );

        let cart: CartModel | null = await CartModel.findOne({
          where: { customerId: customer.id }
        });
        if (cart && cart.companyId !== product.companyId) {
          await CartModel.destroy({
            where: { customerId: customer.id }
          });
          cart = null;
        }
        if (cart === null) {
          cart = await CartModel.create({
            customerId: customer.id,
            companyId: product.companyId,
            totalPrice: 0,
            numberProducts: 0
          });
        }
        const cartProduct: CartProductModel | null = await CartProductModel.findOne(
          {
            where: { cartId: cart.id, productId: product.id }
          }
        );
        await CartModel.update(
          {
            totalPrice: cart.totalPrice + quantity * product.price,
            numberProducts: cart.numberProducts + quantity
          },
          { where: { id: cart.id } }
        );
        if (cartProduct !== null) {
          const prodTmp = await CartProductModel.update(
            { quantity: cartProduct.quantity + quantity },
            {
              where: { id: cartProduct.id },
              returning: true
            }
          );
          const existingCartProduct = prodTmp[1][0];
          existingCartProduct.product = product;
          if (prodTmp[0] !== 0) return existingCartProduct; // At pos 1 of prodTmp there is the list of objects updated, 0 is ths first of them.
        }
        /**
         * Cannot include model in create !
         */
        const cartProductCreated = await CartProductModel.create({
          cartId: cart.id,
          productId: product.id,
          quantity: quantity
        });
        cartProductCreated.product = product;
        return cartProductCreated;
      }
    ),
    removeProductFromCart: combineResolvers(
      isUserAndCustomer,
      async (
        _: any,
        { productId, quantity }: { productId: string; quantity: number },
        { user }: Context
      ): Promise<number> => {
        const customer: CustomerModel | null = user.customer;
        if (!customer)
          throw new ApolloError(
            "This user is not a customer",
            "RESOURCE_NOT_FOUND"
          );
        if (!productId) throw new ApolloError("product is required", "400");
        if (quantity < 0)
          throw new ApolloError(
            "You should remove products, not add them ;)",
            "400"
          );

        const cart: CartModel | null = await CartModel.findOne({
          where: { customerId: customer.id }
        });
        if (cart === null)
          throw new ApolloError(
            "This customer does not have a Cart",
            "RESOURCE_NOT_FOUND"
          );

        let product: CartProductModel | null;
        product = await CartProductModel.findOne({
          where: { productId: productId, cartId: cart.id },
          include: [ProductModel]
        });
        if (!product)
          throw new ApolloError(
            "Cannot find this product in Cart",
            "RESOURCE_NOT_FOUND"
          );
        await CartModel.update(
          {
            totalPrice:
              cart.totalPrice -
              // the quantity to remove is superior or equal than the quantity in the Cart
              (quantity >= product.quantity ? product.quantity : quantity) *
                product.product.price,
            numberProducts:
              cart.numberProducts -
              (cart.numberProducts > quantity ? quantity : cart.numberProducts)
          },
          { where: { id: cart.id } }
        );

        // the quantity to remove is superior or equal than the quantity in the cart
        if (quantity >= product.quantity) {
          // remove the CartProduct from DB
          await CartProductModel.destroy({ where: { id: product.id } });
          return product.quantity;
        } else {
          // remove the quantity from the CartProduct
          await CartProductModel.update(
            { quantity: product.quantity - quantity },
            { where: { id: product.id } }
          );
          return quantity;
        }
      }
    ),
    validateCart: combineResolvers(
      isUserAndStripeCustomer,
      async (_: any, __: any, { user }: Context): Promise<OrderModel> => {
        // Get the cart of the user
        const cart = await CartModel.findOne({
          where: { customerId: user.customer.id },
          include: [{ model: CartProductModel, include: [ProductModel] }]
        });
        if (!cart)
          throw new ApolloError("This customer does not have a cart", "404");
        //Get current card
        const stripeCustomer = await stripe.customers.retrieve(
          user.customer.stripeId
        );
        if (!stripeCustomer.default_source) {
          throw new ApolloError(
            "This customer does not have any default source",
            "404"
          );
        }
        const paymentIntent = await stripe.paymentIntents.create({
          amount: (cart.totalPrice * 100).toFixed(0),
          currency: "eur",
          // eslint-disable-next-line @typescript-eslint/camelcase
          payment_method_types: ["card"],
          customer: stripeCustomer.id,
          // eslint-disable-next-line @typescript-eslint/camelcase
          payment_method: stripeCustomer.default_source
        });

        // Create an order from the cart
        if (!paymentIntent)
          throw new ApolloError("The payment has been refused", "404");
        const order = await OrderModel.create({
          companyId: cart.companyId,
          customerId: cart.customerId,
          price: cart.totalPrice,
          numberProducts: cart.numberProducts,
          status: "PENDING",
          stripePaymentIntent: paymentIntent.id
        }).then(order => {
          OrderModel.update(
            {
              code: order.id.substr(0, 6)
            },
            { where: { id: order.id } }
          );
          return order;
        });
        // Create the products of the order
        cart.products.map(async (cartProduct: CartProductModel, index) => {
          await OrderProductModel.create({
            orderId: order.id,
            productId: cartProduct.productId,
            quantity: cartProduct.quantity,
            price: cartProduct.quantity * cartProduct.product.price
          });
        });
        // Destroy the cart of the user
        CartModel.destroy({ where: { id: cart.id } });

        const company: CompanyModel | null = await CompanyModel.findOne({
          where: { id: order.companyId }
        });
        if (!company) throw new ApolloError("FATAL ERROR", "404");
        CompanyModel.update(
          { numberOrders: company.numberOrders + 1 },
          { where: { id: order.companyId } }
        );

        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        return OrderModel.findOne({
          where: { id: order.id },
          include: OrderIncludes
        });
      }
    )
  }
};
