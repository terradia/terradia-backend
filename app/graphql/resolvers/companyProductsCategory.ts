import ProductModel from "../../database/models/product.model";
import UserModel from "../../database/models/user.model";
import CompanyModel from "../../database/models/company.model";
import CompanyReviewModel from "../../database/models/company-review.model";
import CompanyProductsCategoryModel from "../../database/models/company-products-category.model";
import { ApolloError } from "apollo-server-errors";

export default {
  Query: {
    getAllCompanyProductsCategories: async (
      _parent: any,
      { companyId }: { companyId: string }
    ) => {
      return CompanyProductsCategoryModel.findAll({
        where: { companyId },
        include: [ProductModel]
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
        throw new ApolloError(
          "Cannot find this Category",
          "404"
        );
      }
    }
  }
};
