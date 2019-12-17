import ProductModel from "../../database/models/product.model";
import CategoryModel from "../../database/models/category.model";
import ProductCategoryModel from "../../database/models/product-category.model";
import CompanyModel from "../../database/models/company.model";
import UserModel from "../../database/models/user.model";

interface addCategoryToProductArgs {
  productId: string;
  categoryName: string;
}

interface context {
  user: UserModel;
}

export default {
  Query: {
    getAllProducts: async () => {
      return ProductModel.findAll({
        include: [CategoryModel, CompanyModel]
      });
    },
    getProduct: async (_parent: any, { id }) => {
      return ProductModel.findByPk(id, {
        include: [CategoryModel, CompanyModel]
      });
    },
    getProductsByCompany: async (_parent: any, { companyId }) => {
      return ProductModel.findAll({
        where: { companyId }
      });
    },
    getProductsByCompanyByCategory: async (_parent: any, { companyId }) => {
      return CategoryModel.findAll({
        include: [
          { model: ProductModel, where: { companyId }, include: [CompanyModel] }
        ]
      });
    }
  },
  Mutation: {
    createProduct: async (_parent: any, _args: any, { user }: context) => {
      let product = await ProductModel.create({
        ..._args,
        companyId: user.companyId
      }).then(product => {
        return product;
      });
      return product.toJSON();
    },
    addCategoryToProduct: async (
      _parent: any,
      { productId, categoryName }: addCategoryToProductArgs
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
      } else {
        throw new Error(`The category ${categoryName} doesn't exists.`);
      }
      let product = await ProductModel.findOne({
        where: { id: productId },
        include: [CategoryModel]
      });
      return product ? product.toJSON() : null;
    }
  }
};
