import CategoryModel from "../../database/models/category.model";
import ProductModel from "../../database/models/product.model";
import ProductCategoryModel from "../../database/models/product-category.model";
import {ApolloError} from "apollo-server-errors";

export default {
  Query: {
    getAllCategories: async (): Promise<CategoryModel[]> => {
      return CategoryModel.findAll({
        include: [ProductModel]
      });
    },
    getCategoryByName: async (_: any, { name }: { name: string }): Promise<CategoryModel | null> => {
      return CategoryModel.findOne({
        where: { name },
        include: [ProductModel]
      });
    }
  },
  Mutation: {
    createCategory: async (
        _: any,
      args: { name: string; parentCategoryId?: string }
    ): Promise<CategoryModel> => {
      return CategoryModel.create(args);
    },
    deleteCategory: async (_: any, { id }: { id: string }): Promise<CategoryModel> => {
      let category: CategoryModel | null = await CategoryModel.findByPk(id);
      if (category) {
        await CategoryModel.destroy({ where: { id } });
        await ProductCategoryModel.destroy({ where: { categoryId: id } });
        return category;
      } else
        throw new ApolloError(
          "The category was already deleted or, does not exist",
          "404"
        );
    }
  }
};
