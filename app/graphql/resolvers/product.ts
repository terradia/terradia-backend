import ProductModel from "../../database/models/product.model";
import CategoryModel from "../../database/models/category.model";
import ProductCategoryModel from "../../database/models/product-category.model";
import CompanyModel from "../../database/models/company.model";
import ProductReviewModel from "../../database/models/product-review.model";

import { ApolloError } from "apollo-server-errors";
import CustomerModel from "../../database/models/customer.model";
import UserModel from "../../database/models/user.model";
import UnitModel from "../../database/models/unit.model";
import { Op } from "sequelize";

export default {
  Query: {
    getAllProducts: async () => {
      return ProductModel.findAll({
        include: [CategoryModel, CompanyModel, ProductReviewModel]
      });
    },
    getProduct: async (_parent: any, { id }: { id: string }) => {
      return await ProductModel.findByPk(id, {
        include: [
          CategoryModel,
          CompanyModel,
          {
            model: ProductReviewModel,
            include: [{ model: CustomerModel, include: [UserModel] }]
          }
        ]
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
          {
            model: ProductModel,
            where: { companyId },
            include: [CompanyModel, ProductReviewModel]
          }
        ]
      });
    },
    getAllUnits: async (
      _: any,
      { referencesOnly = false }: { referencesOnly?: boolean }
    ) => {
      if (referencesOnly === true)
        return UnitModel.findAll({
          where: { referenceUnitId: { [Op.is]: null } }
        });
      return UnitModel.findAll();
    },
    getUnit: async (
      _parent: any,
      { id, notation, name }: { id: string; notation?: string; name?: string }
    ) => {
      if (!name && !notation && !id)
        throw new ApolloError(
          "You should at least give one of the three arguments",
          "400"
        );
      let options: any = {};
      if (id) options["id"] = id;
      else if (notation) options["notation"] = notation;
      else if (name) options["name"] = name;
      const unit = await UnitModel.findOne({
        where: options
      });
      if (!unit)
        throw new ApolloError(
          "Cannot find this unit.",
          "404"
        );
      return unit;
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
