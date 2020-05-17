import UserModel from "../../database/models/user.model";
import { ApolloError } from "apollo-server";
import CartModel from "../../database/models/cart.model";
import CustomerModel from "../../database/models/customer.model";
import CartProductModel from "../../database/models/cart-product.model";
import ProductModel from "../../database/models/product.model";
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated, isUserAndCustomer } from "./authorization";
import CompanyModel from "../../database/models/company.model";

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
              include: [ProductModel]
            }
          ]
        });
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
            totalPrice: 0
          });
        }
        const cartProduct: CartProductModel | null = await CartProductModel.findOne(
          {
            where: { cartId: cart.id, productId: product.id }
          }
        );
        await CartModel.update(
          {
            totalPrice: cart.totalPrice + quantity * product.price
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
          throw new ApolloError(
            "This user is not a customer",
            "RESOURCE_NOT_FOUND"
          );
        if (!cartProductId && !productId)
          throw new ApolloError(
            "You should precise at least a cartProduct of a productId",
            "400"
          );
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
                product.product.price
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
    )
  }
};
