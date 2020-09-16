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
import CompanyImageModel from "../../database/models/company-image.model";
import {
  uploadToS3AsCompany,
  uploadToS3SaveAsProductCover
} from "../../uploadS3";
import ProductCompanyImageModel from "../../database/models/product-company-images.model";
import { CompanyImageData } from "./companyImages";

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
      const product = await ProductModel.findByPk(id, {
        include: [
          { model: CompanyImageModel, as: "images" },
          CategoryModel,
          CompanyModel,
          {
            model: CompanyProductsCategoryModel,
            include: [CompanyModel]
          },
          {
            model: ProductReviewModel,
            include: [{ model: CustomerModel, include: [UserModel] }]
          },
          {
            model: ProductCompanyImageModel,
            as: "cover",
            include: [CompanyImageModel]
          }
        ]
      });
      if (!product) throw new ApolloError("This product does not exist", "404");
      return product;
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
          coverId?: string;
          companyProductsCategoryId?: string;
        }
      ): Promise<Partial<ProductModel>> => {
        const company: CompanyModel | null = await CompanyModel.findOne({
          where: { id: args.companyId }
        });
        const productsSameCategory = await ProductModel.findAll({
          where: {
            companyProductsCategoryId: args.companyProductsCategoryId
              ? args.companyProductsCategoryId
              : null
          }
        });
        const pos = productsSameCategory.length;
        if (company) {
          const product: ProductModel = await ProductModel.create({
            ...args,
            position: pos
          }).then(product => {
            ProductCompanyImageModel.create({
              productId: product.id,
              companyImageId: args.coverId
            }).then(image => {
              product.update({ coverId: image.id });
            });
            return product;
          });
          return product.toJSON();
        } else throw new ApolloError("This company does not exist", "404");
      }
    ),
    addCategoryToProduct: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        { productId, categoryName }: { productId: string; categoryName: string }
      ): Promise<Partial<ProductModel> | null> => {
        const category: CategoryModel | null = await CategoryModel.findOne({
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
      }
    ),
    updateProductsPosition: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        { productsPositions }: { productsPositions: [ProductsPositionsData] }
      ): Promise<boolean> => {
        for (const productPosition of productsPositions) {
          if (productPosition.type === "addCategory") {
            ProductModel.update(
              {
                companyProductsCategoryId: productPosition.categoryId,
                position: productPosition.position
              },
              {
                where: {
                  id: productPosition.productId
                }
              }
            );
          } else if (productPosition.type === "deleteCategory") {
            ProductModel.update(
              {
                companyProductsCategoryId: null,
                position: productPosition.position
              },
              {
                where: {
                  id: productPosition.productId
                }
              }
            );
          } else if (productPosition.type === "moveCategory") {
            ProductModel.update(
              {
                companyProductsCategoryId: productPosition.categoryId,
                position: productPosition.position
              },
              {
                where: {
                  id: productPosition.productId
                }
              }
            );
          } else {
            ProductModel.update(
              {
                position: productPosition.position
              },
              {
                where: {
                  id: productPosition.productId
                }
              }
            );
          }
        }
        return true;
      }
    ),
    updateProduct: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        args: {
          productId: string;
          name?: string;
          description?: string;
          unitId?: string;
          quantityForUnit?: number;
          price?: number;
          coverId?: string;
        }
      ): Promise<ProductModel | null> => {
        if (args.productId === undefined)
          throw new ApolloError("You need to provide an ID.", "400");
        const product: ProductModel | null = await ProductModel.findOne({
          where: { id: args.productId }
        });
        if (!product)
          throw new ApolloError("The product does not exist", "404");
        const cover: any = {};
        let newResource: any = undefined;
        if (args.coverId) {
          newResource = await ProductCompanyImageModel.findOrCreate({
            where: {
              productId: args.productId,
              companyImageId: args.coverId
            }
          });
          cover["coverId"] = newResource[0].id;
        }
        const productResult: [
          number,
          ProductModel[]
        ] = await ProductModel.update(
          {
            ...args,
            ...cover
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
        return ProductModel.findOne({ where: { id: args.productId } });
      }
    ),
    // returns the number of products deleted : 1 => your product was well deleted.
    deleteProduct: combineResolvers(
      isAuthenticated,
      async (_: any, { productId }: { productId: string }): Promise<number> => {
        if (productId === undefined)
          throw new ApolloError(
            "The product you try to delete, does not exist.",
            "404"
          );
        return ProductModel.destroy({
          where: { id: productId }
        });
      }
    ),
    addImageToProduct: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        {
          companyImageId,
          productId,
          isCover
        }: { companyImageId: string; productId: string; isCover?: boolean }
      ): Promise<CompanyImageModel> => {
        const product: ProductModel | null = await ProductModel.findOne({
          where: { id: productId }
        });
        if (!product) throw new ApolloError("Product not found", "404");

        const companyImage: CompanyImageModel | null = await CompanyImageModel.findOne(
          { where: { id: companyImageId } }
        );
        if (!companyImage)
          throw new ApolloError("CompanyImage not found", "404");

        const newResource = await ProductCompanyImageModel.create({
          productId,
          companyImageId
        });
        if (isCover === true) {
          await ProductModel.update(
            { coverId: newResource.id },
            { where: { id: productId } }
          );
        }
        return companyImage;
      }
    ),
    uploadImageOfProduct: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        {
          image,
          productId,
          isCover
        }: { image: CompanyImageData; productId: string; isCover?: boolean }
      ): Promise<CompanyImageModel> => {
        const product: ProductModel | null = await ProductModel.findOne({
          where: { id: productId }
        });
        if (!product) throw new ApolloError("Product not found", "404");

        // create the image in S3
        const { stream, filename } = await image;
        const imageCreated = await uploadToS3AsCompany(
          filename,
          stream,
          product.companyId,
          null,
          name
        );
        // create the image in S3

        const newResource = await ProductCompanyImageModel.create({
          productId,
          companyImageId: imageCreated.image.id
        });
        if (isCover === true) {
          await ProductModel.update(
            { coverId: newResource.id },
            { where: { id: productId } }
          );
        }
        return imageCreated.image;
      }
    ),
    deleteImageFromProduct: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        {
          companyImageId,
          productId
        }: { companyImageId: string; productId: string }
      ): Promise<CompanyImageModel> => {
        const product: ProductModel | null = await ProductModel.findOne({
          where: { id: productId }
        });
        if (!product) throw new ApolloError("Product not found", "404");
        const companyImage: CompanyImageModel | null = await CompanyImageModel.findOne(
          {
            where: { id: companyImageId }
          }
        );
        if (!companyImage) throw new ApolloError("Image not found", "404");

        await ProductCompanyImageModel.destroy({
          where: { productId, companyImageId }
        });
        return companyImage;
      }
    ),
    updateProductCover: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        {
          companyImageId,
          productId
        }: { companyImageId: string; productId: string }
      ): Promise<ProductModel> => {
        const product: ProductModel | null = await ProductModel.findOne({
          where: { id: productId }
        });
        if (!product) throw new ApolloError("Product not found", "404");
        const companyImage: CompanyImageModel | null = await CompanyImageModel.findOne(
          {
            where: { id: companyImageId }
          }
        );
        if (!companyImage) throw new ApolloError("Image not found", "404");

        let ret: ProductCompanyImageModel | null = await ProductCompanyImageModel.findOne(
          { where: { productId, companyImageId } }
        );
        // if the image is not an image of the product, it is added
        if (!ret) {
          ret = await ProductCompanyImageModel.create({
            productId,
            companyImageId
          });
        }
        const result: [number, ProductModel[]] = await ProductModel.update(
          { coverId: ret.id },
          { where: { id: productId }, returning: true }
        );

        return result[1][0];
      }
    )
  }
};
