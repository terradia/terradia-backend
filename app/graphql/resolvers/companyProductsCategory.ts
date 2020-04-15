import ProductModel from "../../database/models/product.model";
import CompanyProductsCategoryModel from "../../database/models/company-products-category.model";
import { ApolloError } from "apollo-server-errors";
import CompanyModel from "../../database/models/company.model";
import {WhereOptions} from "sequelize";
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated } from "./authorization";

interface CompanyProductsAllCategoriesData {
  nonCategories: ProductModel[]
  categories: CompanyProductsCategoryModel[]
}

export default {
  Query: {
    getAllCompanyProductsCategories: async (
        _: any,
      { companyId }: { companyId: string }): Promise<CompanyProductsAllCategoriesData> => {
      const categories = await CompanyProductsCategoryModel.findAll({
        where: { companyId },
        include: [ProductModel, CompanyModel]
      });
      const nonCategories = await ProductModel.findAll({
        where: {
          companyId,
          companyProductsCategoryId: null
        }
      });
      return {categories, nonCategories}
    },
    getCompanyProductsCategory: async (
        _: any,
      {companyId, name, categoryId}:
          { companyId: string; name?: string; categoryId?: string }): Promise<CompanyProductsCategoryModel | null> => {
      let where : WhereOptions;
      if (name) where = { companyId, name };
      else if (categoryId) where = { companyId, id: categoryId };
      else throw new ApolloError("precise at least one filter", "403");
      return CompanyProductsCategoryModel.findOne({
        where,
        include: [ProductModel]
      });
    }
  },
  Mutation: {
    createCompanyProductsCategory: combineResolvers(isAuthenticated,
      async (
        _: any,
      { companyId, name }: { companyId: string; name: string }
    ): Promise<CompanyProductsCategoryModel | null> => {
      let [productsCategory]: [CompanyProductsCategoryModel, boolean] = await CompanyProductsCategoryModel.findOrCreate({
        where: {
          name: name,
          companyId: companyId
        },
        defaults: {
          name: name,
          companyId: companyId
        }
      })
      if (!productsCategory)
        throw new ApolloError("Can't create the Products Category");
      return CompanyProductsCategoryModel.findByPk(productsCategory.id, {
        include: [CompanyModel, ProductModel]
      });
    }),
    removeCompanyProductsCategory: combineResolvers(isAuthenticated,
      async (
        _: any,
      { categoryId }: { categoryId: string }
    ): Promise<CompanyProductsCategoryModel | null> => {
      const category: CompanyProductsCategoryModel | null = await CompanyProductsCategoryModel.findOne({
        where: { id: categoryId },
        include: [ProductModel, CompanyModel]
      });
      if (category) {
        // remove the category to all the Products that was linked to it.
        category.products.forEach((element: ProductModel) => {
          ProductModel.update(
            { companyProductsCategoryId: null },
            { where: { id: element.id } }
          );
        });
        await CompanyProductsCategoryModel.destroy({
          where: { id: categoryId }
        });
        return category;
      } else {
        throw new ApolloError("Cannot find this Category", "404");
      }
    }),
    addProductToCompanyCategory: combineResolvers(isAuthenticated,
      async (
        _: any,
      { categoryId, productId }: { categoryId: string; productId: string }
    ): Promise<ProductModel | null> => {
      const product: ProductModel | null = await ProductModel.findOne({ where: { id: productId } });
      const category: CompanyProductsCategoryModel | null = await CompanyProductsCategoryModel.findOne({
        where: { id: categoryId }
      });
      if (product) {
        if (category) {
          if (category.companyId != product.companyId)
            throw new ApolloError(
              "This product is not owned by this company.",
              "403"
            );
          ProductModel.update(
            { companyProductsCategoryId: categoryId },
            { where: { id: productId } }
          );
          return product;
        } else throw new ApolloError("Category not found", "404");
      } else throw new ApolloError("Product not found", "404");
    }),
    removeProductFromCompanyCategory: combineResolvers(isAuthenticated,
      async (
        _: any,
      { productId }: { productId: string }
    ): Promise<ProductModel | null> => {
      const product: ProductModel | null = await ProductModel.findOne({
        where: { id: productId },
        include: [CompanyProductsCategoryModel]
      });
      if (product && product.companyProductsCategoryId !== null) {
        ProductModel.update(
          { companyProductsCategoryId: null },
          { where: { id: productId } }
        );
        return product;
      } else
        throw new ApolloError(
          "This product is not in any category of products",
          "404"
        );
    })
  }
};
