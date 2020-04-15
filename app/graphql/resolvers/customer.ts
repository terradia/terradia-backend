import CustomerModel from "../../database/models/customer.model";
import UserModel from "../../database/models/user.model";
import CompanyReviewModel from "../../database/models/company-review.model";
import CompanyModel from "../../database/models/company.model";
import CustomersFavoriteCompaniesModel from "../../database/models/customers-favorite-companies.model";
import { ApolloError } from "apollo-server";
import BasketModel from "../../database/models/basket.model";
import ProductModel from "../../database/models/product.model";
import BasketProductModel from "../../database/models/basket-product.model";

interface FavoriteArgs {
  companyId: string;
}

interface Context {
  user: UserModel;
}

export default {
  Query: {
    getAllCustomers: async (): Promise<CustomerModel[]> => {
      return CustomerModel.findAll({
        include: [UserModel, CompanyReviewModel, CompanyModel]
      });
    },
    getCustomer: async (
      _: any,
      { userId }: { userId: string }
    ): Promise<CustomerModel | null> => {
      return CustomerModel.findOne({
        where: { userId },
        include: [UserModel, CompanyReviewModel, CompanyModel]
      });
    },
    getCustomerFavoriteCompanies: async (
      _: any,
      { userId }: { userId: string },
      { user }: Context
    ) => {
      let id = userId ? userId : user.id;
      const customer: CustomerModel | null = await CustomerModel.findOne({
        where: { userId: id },
        include: [UserModel, CompanyReviewModel, CompanyModel]
      });
      return customer?.favoriteCompanies;
    },
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
    defineUserAsCustomer: async (_: any, { userId }: { userId: string }) => {
      let [result] = await CustomerModel.findOrCreate({
        where: { userId },
        defaults: {
          userId
        }
      });
      return CustomerModel.findOne({
        where: { id: result.id },
        include: [UserModel]
      });
    },
    addFavoriteCompany: async (
      _: any,
      { companyId }: FavoriteArgs,
      { user }: Context
    ): Promise<CustomerModel | null> => {
      const company: CompanyModel | null = await CompanyModel.findOne({
        where: { id: companyId }
      });
      const customerId: string = user.customer.id;
      if (company) {
        await CustomersFavoriteCompaniesModel.findOrCreate({
          where: { companyId, customerId }
        });
      } else {
        throw new ApolloError(
          "This company does not exists.",
          "RESOURCE_NOT_FOUND"
        );
      }
      return CustomerModel.findByPk(customerId, {
        include: [CompanyModel, CompanyReviewModel, UserModel]
      });
    },
    removeFavoriteCompany: async (
      _: any,
      { companyId }: FavoriteArgs,
      { user }: Context
    ): Promise<CustomerModel | null> => {
      if (!user.customer)
        throw new ApolloError("User is not a customer", "500");
      const company: CompanyModel | null = await CompanyModel.findByPk(
        companyId
      );
      const customerId: string = user.customer.id;
      if (company) {
        await CustomersFavoriteCompaniesModel.destroy({
          where: { companyId, customerId }
        });
      } else {
        throw new Error("This company does not exists.");
      }
      return CustomerModel.findByPk(customerId, {
        include: [CompanyModel, CompanyReviewModel, UserModel]
      });
    },
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
