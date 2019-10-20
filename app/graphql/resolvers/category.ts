import CategoryModel from "../../database/models/category.model";
import ProductModel from "../../database/models/product.model";
import ProductCategoryModel from "../../database/models/product-cateogry.model";

export default {
  Query: {
    getAllCategories: async (_parent, _args, _context) => {
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
    }
  },
  Mutation: {
    createCategory: async (_parent, _args, _context) => {
      let category = await CategoryModel.create(_args);
      return category.toJSON();
    },
    deleteCategory: async (_parent, _args, _context) => {
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
