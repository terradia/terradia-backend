import CompanyUserModel from "../../database/models/company-user.model";
import UserModel from "../../database/models/user.model";
import CompanyModel from "../../database/models/company.model";
import {ApolloError} from "apollo-server";
import RoleModel from "../../database/models/role.model";
import BasketModel from "../../database/models/basket.model";
import CustomerModel from "../../database/models/customer.model";
import BasketProductModel from "../../database/models/basket-product.model";
import ProductModel from "../../database/models/product.model";

declare interface UserCompanyRoleProps {
  companyUserId: string,
  roleId: string
}

interface Context {
  user: UserModel;
}

export default {
  Query: {
    getBasket: (
      _: any,
      __: any,
      { user }: Context
    ): Promise<BasketModel | null> => {
      // TODO : Check if the products are available
      const customer: CustomerModel = user.customer;
      if (!customer) {
        throw new ApolloError("this user is not a customer", "400");
      }
      if (customer.basket === null) {
        throw new ApolloError("this customer does not have a basket", "400");
      }
      return BasketModel.findOne({
        where: {
          customerId: user.customer.id
        },
        include: [BasketProductModel]
      });
    }
  },
  Mutation: {
    addProductToBasket: async (
      _: any,
      { productId, quantity }: { productId: string; quantity: number },
      { user }: Context
    ): Promise<BasketProductModel> => {
      const customer: CustomerModel | null = user.customer;
      const product: ProductModel | null = await ProductModel.findOne({
        where: { id: productId }
      });
      if (!product)
        throw new ApolloError("Cannot find this product", "RESOURCE_NOT_FOUND");
      if (!customer)
        throw new ApolloError("This user is not a customer", "400");
      if (quantity < 0)
        throw new ApolloError(
          "You should add products, not remove them ;)",
          "400"
        );

      let basket: BasketModel | null = await BasketModel.findOne({
        where: { customerId: customer.id }
      });
      if (basket && basket.companyId !== product.companyId) {
        await BasketModel.destroy({
          where: { customerId: customer.id }
        });
        basket = null;
      }
      if (basket === null) {
        basket = await BasketModel.create({
          customerId: customer.id,
          companyId: product.companyId,
          totalPrice: 0
        });
      }
      const basketProduct: BasketProductModel | null = await BasketProductModel.findOne(
        {
          where: { basketId: basket.id, productId: product.id }
        }
      );
      await BasketModel.update(
        {
          totalPrice: basket.totalPrice + quantity * product.price
        },
        { where: { id: basket.id } }
      );
      if (basketProduct !== null) {
        const prodTmp = await BasketProductModel.update(
          { quantity: basketProduct.quantity + quantity },
          {
            where: { id: basketProduct.id },
            returning: true
          }
        );
        if (prodTmp[0] !== 0) return prodTmp[1][0]; // At pos 1 of prodTmp there is the list of objects updated, 0 is ths first of them.
      }
      return BasketProductModel.create(
        {
          basketId: basket.id,
          productId: product.id,
          quantity: quantity
        },
        { include: [ProductModel] }
      );
    },
    removeProductFromBasket: async (
      _: any,
      {
        basketProductId,
        productId,
        quantity
      }: { basketProductId: string; productId: string; quantity: number },
      { user }: Context
    ): Promise<number> => {
      const customer: CustomerModel | null = user.customer;
      if (!customer)
        throw new ApolloError(
          "This user is not a customer",
          "RESOURCE_NOT_FOUND"
        );
      if (!basketProductId && !productId)
        throw new ApolloError(
          "You should precise at least a basketProduct of a productId",
          "400"
        );
      if (quantity < 0)
        throw new ApolloError(
          "You should remove products, not add them ;)",
          "400"
        );

      let basket: BasketModel | null = await BasketModel.findOne({
        where: { customerId: customer.id }
      });
      if (basket === null)
        throw new ApolloError(
          "This customer does not have a Basket",
          "RESOURCE_NOT_FOUND"
        );

      let product: BasketProductModel | null;
      product = await BasketProductModel.findOne({
        where: productId
          ? { productId: productId, basketId: basket.id }
          : { id: basketProductId, basketId: basket.id },
        include: [ProductModel]
      });
      if (!product)
        throw new ApolloError(
          "Cannot find this product in Basket",
          "RESOURCE_NOT_FOUND"
        );
      await BasketModel.update(
        {
          totalPrice:
            basket.totalPrice -
            // the quantity to remove is superior or equal than the quantity in the Basket
            (quantity >= product.quantity ? product.quantity : quantity) *
            product.product.price
        },
        { where: { id: basket.id } }
      );

      // the quantity to remove is superior or equal than the quantity in the Basket
      if (quantity >= product.quantity) {
        // remove the BasketProduct from DB
        await BasketProductModel.destroy({ where: { id: product.id } });
        return product.quantity;
      } else {
        // remove the quantity from the BasketProduct
        await BasketProductModel.update(
          { quantity: product.quantity - quantity },
          { where: { id: product.id } }
        );
        return quantity;
      }
    }
  }
};
