import CategoryModel from "../../database/models/category.model";
import ProductModel from "../../database/models/product.model";
import ProductCategoryModel from "../../database/models/product-cateogry.model";

export default {
  Query: {
    getAllCategories: async (_parent: any, _args: any, _context: any) => {
      return CategoryModel.findAll({
        include: [
          {
            model: ProductModel,
            as: "products",
            required: false,
            attributes: ["id", "name"],
            through: { attributes: [] }
          }
        ]
      });
    },
    getCategoryByName: async (_parent: any, _args: any) => {
      return CategoryModel.findOne({where: {name: _args.name}, include: [ProductModel]});
    }
  },
  Mutation: {
    createCategory: async (_parent: any, _args: any, _context: any) => {
      let category = await CategoryModel.create(_args);
      return category.toJSON();
    },
    deleteCategory: async (_parent: any, _args: any, _context: any) => {
      let category = await CategoryModel.findByPk(_args.id);
      if (category !== null) {
        await CategoryModel.destroy({ where: { id: _args.id } });
        await ProductCategoryModel.destroy({ where: { categoryId: _args.id } });
        return category.toJSON();
      } else {
        throw Error("The category was already deleted or, does not exist");
      }
    }
  }
};
