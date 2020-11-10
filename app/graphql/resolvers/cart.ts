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
import { where } from "sequelize";
import Stripe from "stripe";

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
      (_: any, __: any, { user }: Context): Promise<CartModel | null> => {
        // TODO : Check if the products are available
        const customer: CustomerModel = user.customer;
        if (!customer) {
          throw new ApolloError("NotACustomer", "400");
        }
        if (customer.cart === null) {
          throw new ApolloError("NoCart", "400");
        }
        return CartModel.findOne({
          where: {
            customerId: user.customer.id
          },
          include: [
            CompanyModel,
            {
              model: CartProductModel,
              include: [
                {
                  model: ProductModel,
                  include: [UnitModel]
                }
              ],
              order: ["updatedAt"]
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
          throw new ApolloError("NotACustomer", "400");
        }
        if (customer.cart === null) {
          throw new ApolloError("NoCart", "400");
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
          throw new ApolloError("ProductNotFound", "RESOURCE_NOT_FOUND");
        if (!customer) throw new ApolloError("NotACustomer", "400");
        if (quantity < 0) throw new ApolloError("NegativeQuantity", "400");

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
        {
          cartProductId,
          productId,
          quantity
        }: { cartProductId: string; productId: string; quantity: number },
        { user }: Context
      ): Promise<number> => {
        const customer: CustomerModel | null = user.customer;
        if (!customer)
          throw new ApolloError("NotACustomer", "RESOURCE_NOT_FOUND");
        if (!cartProductId && !productId)
          throw new ApolloError("NoFilter", "400");
        if (quantity < 0) throw new ApolloError("NegativeQuantity", "400");

        const cart: CartModel | null = await CartModel.findOne({
          where: { customerId: customer.id }
        });
        if (cart === null)
          throw new ApolloError(
            "This customer does not have a Cart",
            "RESOURCE_NOT_FOUND"
          );
        const product = await CartProductModel.findOne({
          where: productId
            ? { productId: productId, cartId: cart.id }
            : { id: cartProductId, cartId: cart.id },
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
