import ProductModel from "../../database/models/product.model";
import CategoryModel from "../../database/models/category.model";
import ProductCategoryModel from "../../database/models/product-category.model";
import CompanyModel from "../../database/models/company.model";

export default {
  Query: {
    getAllProducts: async () => {
      return ProductModel.findAll({
        include: [
          CategoryModel,
          CompanyModel
        ]
      });
    },
    getProduct: async (_parent, { id }) => {
      return ProductModel.findOne({
        where: { id },
        include: [
          CategoryModel,
          CompanyModel
        ]
      });
    }
  },
  Mutation: {
    createProduct: async (_parent, _args, { user }) => {
      let product = await ProductModel.create({
        ..._args,
        companyId: user.companyId
      }).then(product => {
        return product;
      });
      return product.toJSON();
    },
    addCategoryToProduct: async (
      _parent,
      { productId, categoryName }
    ) => {
      let category = await CategoryModel.findOne({
        where: { name: categoryName }
      });
      // findOrCreate so that it doesn't add multiple times the category to a product.
      await ProductCategoryModel.findOrCreate({
        where: {
          productId,
          categoryId: category.id
        }
      });
      let product = await ProductModel.findOne({
        where: { id: productId },
        include: [CategoryModel]
      });
      return product ? product.toJSON() : null;
    }
  }
};
