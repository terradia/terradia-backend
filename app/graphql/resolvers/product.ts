import ProductModel from "../../database/models/product.model";
import CategoryModel from "../../database/models/category.model";
import ProductCategoryModel from "../../database/models/product-category.model";
import CompanyModel from "../../database/models/company.model";
import ProductReviewModel from "../../database/models/product-review.model";

import { ApolloError } from "apollo-server-errors";
import CustomerModel from "../../database/models/customer.model";
import UserModel from "../../database/models/user.model";

export default {
  Query: {
    getAllProducts: async () => {
      return ProductModel.findAll({
        include: [CategoryModel, CompanyModel, ProductReviewModel]
      });
    },
    getProduct: async (_parent: any, { id }: { id: string }) => {
      return await ProductModel.findByPk(id, {
        include: [CategoryModel, CompanyModel, {model: ProductReviewModel, include: [{model: CustomerModel, include: [UserModel]}]}]
      });
    },
    getProductsByCompany: async (
      _parent: any,
      { companyId }: { companyId: string }
    ) => {
      const company = CompanyModel.findOne({ where: { id: companyId } });
      if (!company) throw new ApolloError("This company does not exist", "404");
      return ProductModel.findAll({
        where: { companyId }
      });
    },
    getProductsByCompanyByCategory: async (
      _parent: any,
      { companyId }: { companyId: string }
    ) => {
      const company = CompanyModel.findOne({ where: { id: companyId } });
      if (!company) throw new ApolloError("This company does not exist", "404");
      return CategoryModel.findAll({
        include: [
          { model: ProductModel, where: { companyId }, include: [CompanyModel, ProductReviewModel] }
        ]
      });
    }
  },
  Mutation: {
    createProduct: async (
      _parent: any,
      _args: { name: string; description: string; companyId: string }
    ) => {
      const company = CompanyModel.findOne({ where: { id: _args.companyId } });
      if (company) {
        let product = await ProductModel.create({
          ..._args
        }).then(product => {
          return product;
        });
        return product.toJSON();
      } else throw new ApolloError("This company does not exist", "404");
    },
    addCategoryToProduct: async (
      _parent: any,
      { productId, categoryName }: { productId: string; categoryName: string }
    ) => {
      let category = await CategoryModel.findOne({
        where: { name: categoryName }
      });
      if (category) {
        // findOrCreate so that it doesn't add multiple times the category to a product.
        await ProductCategoryModel.findOrCreate({
          where: {
            productId,
            categoryId: category.id
          }
        });
      } else
        throw new ApolloError(
          `The category ${categoryName} doesn't exists.`,
          "404"
        );
      let product = await ProductModel.findOne({
        where: { id: productId },
        include: [CategoryModel]
      });
      return product ? product.toJSON() : null;
    }
  }
};
