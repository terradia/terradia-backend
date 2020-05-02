import ProductModel from "../../database/models/product.model";
import CategoryModel from "../../database/models/category.model";
import ProductCategoryModel from "../../database/models/product-category.model";
import CompanyModel from "../../database/models/company.model";
import ProductReviewModel from "../../database/models/product-review.model";
import { ApolloError } from "apollo-server-errors";
import CustomerModel from "../../database/models/customer.model";
import UserModel from "../../database/models/user.model";
import UnitModel from "../../database/models/unit.model";
import { Op } from "sequelize";
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated } from "./authorization";
import CompanyProductsCategoryModel from "../../database/models/company-products-category.model";
import CompanyImagesModel from "../../database/models/company-images.model";

interface ProductsPositionsData {
  productId: string;
  position: number;
  categoryId: string;
  type: string;
}

export default {
  Query: {
    getAllProducts: async () => {
      return ProductModel.findAll({
        include: [CategoryModel, ProductReviewModel]
      });
    },
    getProduct: async (
      _: any,
      { id }: { id: string }
    ): Promise<ProductModel | null> => {
      let aa = await ProductModel.findByPk(id, {
        include: [
          {model: CompanyImagesModel, as: 'images'},
          CategoryModel,
          CompanyModel,
          {
            model: CompanyProductsCategoryModel,
            include: [CompanyModel]
          },
          {
            model: ProductReviewModel,
            include: [{ model: CustomerModel, include: [UserModel] }]
          }
        ]
      });
      return aa;
    },
    getProductsByCompany: async (
      _: any,
      { companyId }: { companyId: string }
    ): Promise<ProductModel[]> => {
      const company: CompanyModel | null = await CompanyModel.findOne({
        where: { id: companyId }
      });
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
          {
            model: ProductModel,
            where: { companyId },
            include: [CompanyModel, ProductReviewModel]
          }
        ]
      });
    },
    getAllUnits: async (
      _: any,
      { referencesOnly = false }: { referencesOnly?: boolean }
    ): Promise<UnitModel[]> => {
      if (referencesOnly === true)
        return UnitModel.findAll({
          where: { referenceUnitId: { [Op.is]: null } }
        });
      return UnitModel.findAll();
    },
    getUnit: async (
      _: any,
      { id, notation, name }: { id?: string; notation?: string; name?: string }
    ): Promise<UnitModel | null> => {
      if (!name && !notation && !id)
        throw new ApolloError(
          "You should at least give one of the three arguments",
          "400"
        );
      const options: { id?: string; notation?: string; name?: string } = {};
      if (id) options["id"] = id;
      else if (notation) options["notation"] = notation;
      else if (name) options["name"] = name;
      const unit: UnitModel | null = await UnitModel.findOne({
        // @ts-ignore
        where: options
      });
      if (!unit) throw new ApolloError("Cannot find this unit.", "404");
      return unit;
    }
  },
  Mutation: {
    createProduct: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        args: {
          name: string;
          description: string;
          companyId: string;
          price: number;
          quantityForUnit?: number;
          unitId?: string;
          companyProductsCategoryId?: string;
        }
      ): Promise<Partial<ProductModel>> => {
        const company: CompanyModel | null = await CompanyModel.findOne({
          where: { id: args.companyId }
        });
        const productsSameCategory = await ProductModel.findAll({where: {
            companyProductsCategoryId: args.companyProductsCategoryId ? args.companyProductsCategoryId: null
          }});
        let pos = productsSameCategory.length;
        if (company) {
          let product: ProductModel = await ProductModel.create({
            ...args,
            position: pos
          }).then(product => {
            return product;
          });
          return product.toJSON();
        } else throw new ApolloError("This company does not exist", "404");
      }),
    addCategoryToProduct: combineResolvers(isAuthenticated,
      async (
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
        const product: ProductModel | null = await ProductModel.findOne({
          where: { id: productId },
          include: [CategoryModel]
        });
        return product ? product.toJSON() : null;
      }),
    updateProductsPosition: combineResolvers(isAuthenticated,
      async (
        _: any,
        { productsPositions }: { productsPositions: [ProductsPositionsData] }
      ): Promise<boolean> => {
        productsPositions.forEach(async (productPosition: ProductsPositionsData) => {
          if (productPosition.type === "addCategory") {
            ProductModel.update({
              companyProductsCategoryId: productPosition.categoryId,
              position: productPosition.position
            }, {
              where: {
                id: productPosition.productId
              }})
          } else if (productPosition.type === "deleteCategory") {
            ProductModel.update({
              companyProductsCategoryId: null,
              position: productPosition.position
            }, {
              where: {
                id: productPosition.productId
              }})
          } else if (productPosition.type === "moveCategory") {
            ProductModel.update({
              companyProductsCategoryId: productPosition.categoryId,
              position: productPosition.position
            }, {
              where: {
                id: productPosition.productId
              }})
          } else  {
            ProductModel.update({
              position: productPosition.position
            }, {
              where: {
                id: productPosition.productId
              }})
          }
      });
      return true;
      }),
    updateProduct: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        args: {
          productId: string;
          name?: string;
          description?: string;
          image?: string;
          unitId?: string;
          quantityForUnit?: number;
          price?: number;
        }
      ): Promise<Partial<ProductModel>> => {
        if (args.productId === undefined)
          throw new ApolloError("You need to provide an ID.", "400");
        const productResult: [
          number,
          ProductModel[]
          ] = await ProductModel.update(
          {
            ...args
          },
          {
            where: { id: args.productId },
            returning: true
          }
        );
        if (productResult[0] === 0)
          throw new ApolloError(
            "Could not update any field in Database, are you sure the product you want to update exists ?",
            "400"
          );
        return productResult[1][0];
      }
    ),
    // returns the number of products deleted : 1 => your product was well deleted.
    deleteProduct: combineResolvers(
      isAuthenticated,
      async (_: any, { productId }: { productId: string }): Promise<number> => {
        if (productId === undefined)
          throw new ApolloError("The product you try to delete, does not exist.", "404");
        return ProductModel.destroy({
          where: { id: productId }
        });
      }
    )
  }
};
