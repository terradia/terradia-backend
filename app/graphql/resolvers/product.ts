import ProductModel from "../../database/models/product.model";
import CategoryModel from "../../database/models/category.model";
import ProductCategoryModel from "../../database/models/product-cateogry.model";
import CompanyModel from "../../database/models/company.model";

export default {
  Query: {
    getAllProducts: async (_parent: any, _args: any, _context: any) => {
      return ProductModel.findAll({
        include: [CategoryModel,CompanyModel]
      });
    },
    getProduct: async (_parent: any, { id }: any) => {
      return ProductModel.findOne({where: {id: id}, include: [CategoryModel, CompanyModel]});
    }
  },
  Mutation: {
    createProduct: async (_parent: any, _args: any, {user}: any) => {
      let product = await ProductModel.create({ ..._args, companyId: user.companyId }).then((product) =>  {
        return product;
      });
      return product.toJSON();
    },
    addCategoryToProduct: async (
      _parent: any,
      { productId, categoryName}: any,
      _context: any
    ) => {
      let category = await CategoryModel.findOne({
        where: { name: categoryName }
      });
      if (!category)
        return null;
      // findOrCreate so that it doesn't add multiple times the category to a product.
      await ProductCategoryModel.findOrCreate({
        where: {
          productId,
          categoryId: category.id
        }
      });
      let product = await ProductModel.findOne({
        where: {id: productId},
        include: [
          {
            model: CategoryModel,
            as: "categories",
            required: false,
            attributes: ["id", "name"],
            through: { attributes: [] }
          }
        ]
      });
      return product ? product.toJSON() : null;
    }
  }
};
