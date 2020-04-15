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
        include: [CategoryModel, ProductReviewModel]
      });
    },
    getProduct: async (
      _: any,
      { id }: { id: string }
    ): Promise<ProductModel | null> => {
      return ProductModel.findByPk(id, {
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
      _: any,
      { companyId }: { companyId: string }
    ): Promise<ProductModel[]> => {
      const company: CompanyModel | null = await CompanyModel.findOne({
        where: { id: companyId }
      });
      if (!company) throw new ApolloError("This company does not exist", "404");
      return ProductModel.findAll({
        where: { companyId }
      });
    },
    getProductsByCompanyByCategory: async (
      _: any,
      { companyId }: { companyId: string }
    ): Promise<CategoryModel[]> => {
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
    ): Promise<UnitModel[]> => {
      if (referencesOnly === true)
        return UnitModel.findAll({
          where: { referenceUnitId: { [Op.is]: null } }
        });
      return UnitModel.findAll();
    },
    getUnit: async (
      _: any,
      { id, notation, name }: { id?: string; notation?: string; name?: string }
    ): Promise<UnitModel | null> => {
      if (!name && !notation && !id)
        throw new ApolloError(
          "You should at least give one of the three arguments",
          "400"
        );
      let options: { id?: string; notation?: string; name?: string } = {};
      if (id) options["id"] = id;
      else if (notation) options["notation"] = notation;
      else if (name) options["name"] = name;
      const unit: UnitModel | null = await UnitModel.findOne({
        // @ts-ignore
        where: options
      });
      if (!unit) throw new ApolloError("Cannot find this unit.", "404");
      return unit;
    }
  },
  Mutation: {
    createProduct: async (
      _: any,
      args: {
        name: string;
        description: string;
        companyId: string;
        price: number;
        quantityForUnit?: number;
        unitId?: string;
        companyProductsCategoryId?: string;
      }
    ): Promise<Partial<ProductModel>> => {
      const company: CompanyModel | null = await CompanyModel.findOne({
        where: { id: args.companyId }
      });
      if (company) {
        let product: ProductModel = await ProductModel.create({
          ...args
        }).then(product => {
          return product;
        });
        return product.toJSON();
      } else throw new ApolloError("This company does not exist", "404");
    },
    addCategoryToProduct: async (
      _: any,
      { productId, categoryName }: { productId: string; categoryName: string }
    ): Promise<Partial<ProductModel> | null> => {
      let category: CategoryModel | null = await CategoryModel.findOne({
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
      let product: ProductModel | null = await ProductModel.findOne({
        where: { id: productId },
        include: [CategoryModel]
      });
      return product ? product.toJSON() : null;
    }
  }
};
