import CategoryModel from "../../database/models/category.model";
import ProductModel from "../../database/models/product.model";
import ProductCategoryModel from "../../database/models/product-category.model";
import { ApolloError } from "apollo-server-errors";

export default {
  Query: {
    getAllCategories: async () => {
      return CategoryModel.findAll({
        include: [ProductModel]
      });
    },
    getCategoryByName: async (_parent: any, { name }: { name: string }) => {
      return CategoryModel.findOne({
        where: { name },
        include: [ProductModel]
      });
    }
  },
  Mutation: {
    createCategory: async (
      _parent: any,
      _args: { name: string; parentCategoryId?: string }
    ) => {
      let category = await CategoryModel.create(_args);
      return category.toJSON();
    },
    deleteCategory: async (_parent: any, { id }: { id: string }) => {
      let category = await CategoryModel.findByPk(id);
      if (category) {
        await CategoryModel.destroy({ where: { id } });
        await ProductCategoryModel.destroy({ where: { categoryId: id } });
        return category.toJSON();
      } else
        throw new ApolloError(
          "The category was already deleted or, does not exist",
          "404"
        );
    }
  }
};
