import ProductModel from "../../database/models/product.model";

export default {
  Query: {
    getAllProducts: async (_parent, _args, _context) => {
      return ProductModel.findAll();
    },
    getProduct: async (_parent, { id }) => {
      return ProductModel.findOne({
        id
      });
    }
  },
  Mutation: {
    createProduct: async (_parent, _args) => {
      let product = await ProductModel.create(_args);
      return product.toJSON();
    }
  }
};
