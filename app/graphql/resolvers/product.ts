import ProductModel from "../../database/models/product.model";
import CategoryModel from "../../database/models/category.model";
import ProductCategoryModel from "../../database/models/product-category.model";
import CompanyModel from "../../database/models/company.model";
import ProductReviewModel from "../../database/models/product-review.model";
import { ApolloError } from "apollo-server-errors";
import CustomerModel from "../../database/models/customer.model";
import UserModel from "../../database/models/user.model";

export default {
  Query: {
    getAllProducts: async () => {
      return ProductModel.findAll({
        include: [CategoryModel, CompanyModel, ProductReviewModel]
      });
    },
    getProduct: async (
        _: any,
        { id }: { id: string }
        ): Promise<ProductModel | null> => {
      return ProductModel.findByPk(id, {
        include: [CategoryModel, CompanyModel, {
          model: ProductReviewModel,
          include: [{model: CustomerModel, include: [UserModel]}]
        }]
      });
    },
    getProductsByCompany: async (
        _: any,
      { companyId }: { companyId: string }
    ): Promise<ProductModel[]> => {
      const company: CompanyModel | null = await CompanyModel.findOne({ where: { id: companyId } });
      if (!company) throw new ApolloError("This company does not exist", "404");
      return ProductModel.findAll({
        where: { companyId }
      });
    },
    getProductsByCompanyByCategory: async (
        _: any,
      { companyId }: { companyId: string }
    ): Promise<CategoryModel[]> => {
      const company = CompanyModel.findOne({ where: { id: companyId } });
      if (!company) throw new ApolloError("This company does not exist", "404");
      return CategoryModel.findAll({
        include: [
          { model: ProductModel, where: { companyId }, include: [CompanyModel, ProductReviewModel] }
        ]
      });
    }
  },
  Mutation: {
    createProduct: async (
        _: any,
      args: { name: string; description: string; companyId: string }
    ): Promise<Partial<ProductModel>> => {
      const company: CompanyModel | null = await CompanyModel.findOne({ where: { id: args.companyId } });
      if (company) {
        let product: ProductModel = await ProductModel.create({
          ...args
        }).then(product => {
          return product;
        });
        return product.toJSON();
      } else throw new ApolloError("This company does not exist", "404");
    },
    addCategoryToProduct: async (
      _: any,
      { productId, categoryName }: { productId: string; categoryName: string }
    ): Promise<Partial<ProductModel> | null> => {
      let category: CategoryModel | null = await CategoryModel.findOne({
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
      } else
        throw new ApolloError(
          `The category ${categoryName} doesn't exists.`,
          "404"
        );
      let product: ProductModel | null = await ProductModel.findOne({
        where: { id: productId },
        include: [CategoryModel]
      });
      return product ? product.toJSON() : null;
    }
  }
};
