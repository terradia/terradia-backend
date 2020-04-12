import ProductModel from "../../database/models/product.model";
import CompanyProductsCategoryModel from "../../database/models/company-products-category.model";
import { ApolloError } from "apollo-server-errors";
import CompanyModel from "../../database/models/company.model";

export default {
  Query: {
    getAllCompanyProductsCategories: async (
      _parent: any,
      { companyId }: { companyId: string }
    ) => {
      return CompanyProductsCategoryModel.findAll({
        where: { companyId },
        include: [ProductModel, CompanyModel]
      });
    },
    getCompanyProductsCategory: async (
      _parent: any,
      {
        companyId,
        name,
        categoryId
      }: { companyId: string; name?: string; categoryId?: string }
    ) => {
      let where;
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
    createCompanyProductsCategory: async (
      _parent: any,
      { companyId, name }: { companyId: string; name: string }
    ) => {
      let cat = await CompanyProductsCategoryModel.findOne({
        name,
        companyId
      });
      if (cat) return cat.toJSON();
      cat = await CompanyProductsCategoryModel.create({ name, companyId });
      return cat.toJSON();
    },
    removeCompanyProductsCategory: async (
      _parent: any,
      { categoryId }: { categoryId: string }
    ) => {
      const category = await CompanyProductsCategoryModel.findOne({
        where: { id: categoryId },
        include: [ProductModel]
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
    },
    addProductToCompanyCategory: async (
      _parent: any,
      { categoryId, productId }: { categoryId: string; productId: string }
    ) => {
      const product = await ProductModel.findOne({ where: { id: productId } });
      const category = await CompanyProductsCategoryModel.findOne({
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
    },
    removeProductFromCompanyCategory: async (
      _parent: any,
      { productId }: { productId: string }
    ) => {
      const product = await ProductModel.findOne({
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
    }
  }
};
