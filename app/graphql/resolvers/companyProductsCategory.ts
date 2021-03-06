import ProductModel from "../../database/models/product.model";
import CompanyProductsCategoryModel from "../../database/models/company-products-category.model";
import { ApolloError } from "apollo-server-errors";
import CompanyModel from "../../database/models/company.model";
import { WhereOptions } from "sequelize";
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated } from "./authorization";
import CompanyImageModel from "../../database/models/company-image.model";
import UnitModel from "../../database/models/unit.model";
import ProductCompanyImageModel from "../../database/models/product-company-images.model";

export default {
  Query: {
    getCompanyProductsCategories: async (
      _: any,
      { companyId }: { companyId: string }
    ): Promise<CompanyProductsCategoryModel[]> => {
      const categories: CompanyProductsCategoryModel[] = await CompanyProductsCategoryModel.findAll(
        {
          where: { companyId },
          include: [
            {
              model: ProductModel,
              include: [
                { model: CompanyImageModel, as: "images" },
                UnitModel,
                {
                  model: ProductCompanyImageModel,
                  as: "cover",
                  include: [CompanyImageModel]
                }
              ]
            }
          ]
        }
      );
      return categories;
    },
    getAllCompanyProductsCategories: async (
      _: any,
      { companyId }: { companyId: string }
    ): Promise<CompanyProductsCategoryModel[]> => {
      const company = await CompanyModel.findOne({ where: { id: companyId } });
      if (!company) throw new ApolloError("Company not found", "404");
      const products = await ProductModel.findAll({
        where: { companyId },
        include: [
          { model: CompanyImageModel, as: "images" },
          UnitModel,
          CompanyImageModel,
          {
            model: ProductCompanyImageModel,
            as: "cover",
            include: [CompanyImageModel]
          }
        ]
      });
      const categories: CompanyProductsCategoryModel[] = await CompanyProductsCategoryModel.findAll(
        {
          where: { companyId },
          include: [CompanyModel]
        }
      );
      categories.map((cat: CompanyProductsCategoryModel) => {
        cat.products = products.filter(
          elem => elem.companyProductsCategoryId === cat.id
        );
      });
      const nonCategories = await ProductModel.findAll({
        where: {
          companyId,
          companyProductsCategoryId: null
        },
        include: [
          UnitModel,
          { model: CompanyImageModel, as: "images" },
          {
            model: ProductCompanyImageModel,
            as: "cover",
            include: [CompanyImageModel]
          }
        ]
      });
      const nonCat: CompanyProductsCategoryModel = CompanyProductsCategoryModel.build(
        {
          id: `nonCat${companyId}`,
          name: "NonCategories",
          products: nonCategories,
          company
        },
        {
          include: [
            {
              model: ProductModel,
              include: [
                { model: CompanyImageModel, as: "images" },
                UnitModel,
                {
                  model: ProductCompanyImageModel,
                  as: "cover",
                  include: [CompanyImageModel]
                }
              ]
            },
            CompanyModel
          ]
        }
      );
      nonCat.products = products.filter(
        elem => elem.companyProductsCategoryId === null
      );
      categories.push(nonCat);
      return categories;
    },
    getCompanyProductsCategory: async (
      _: any,
      {
        companyId,
        name,
        categoryId
      }: { companyId: string; name?: string; categoryId?: string }
    ): Promise<CompanyProductsCategoryModel | null> => {
      let where: WhereOptions;
      if (name) where = { companyId, name };
      else if (categoryId) where = { companyId, id: categoryId };
      else throw new ApolloError("precise at least one filter", "403");
      return CompanyProductsCategoryModel.findOne({
        where,
        include: [ProductModel]
      });
    }
  },
  Mutation: {
    createCompanyProductsCategory: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        { companyId, name }: { companyId: string; name: string }
      ): Promise<CompanyProductsCategoryModel | null> => {
        const productsCategory: [
          CompanyProductsCategoryModel,
          boolean
        ] = await CompanyProductsCategoryModel.findOrCreate({
          where: {
            name: name,
            companyId: companyId
          }
        });
        console.log("productsCategory");
        if (!productsCategory[0])
          throw new ApolloError("Error while creating the Category");
        return CompanyProductsCategoryModel.findOne({
          where: { id: productsCategory[0].id }
        });
      }
    ),
    removeCompanyProductsCategory: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        { categoryId }: { categoryId: string }
      ): Promise<CompanyProductsCategoryModel | null> => {
        const category: CompanyProductsCategoryModel | null = await CompanyProductsCategoryModel.findOne(
          {
            where: { id: categoryId },
            include: [ProductModel, CompanyModel]
          }
        );
        if (!category) {
          throw new ApolloError("Cannot find this Category", "404");
        }
        const nonCategories = await ProductModel.findAll({
          where: {
            companyId: category.companyId,
            companyProductsCategoryId: null
          }
        });
        let currentLength = nonCategories.length;
        for (const element of category.products) {
          const elem = await element;
          currentLength++;
          ProductModel.update(
            {
              companyProductsCategoryId: null,
              position: currentLength
            },
            { where: { id: elem.id } }
          );
        }
        await CompanyProductsCategoryModel.destroy({
          where: { id: categoryId }
        });
        return category;
      }
    ),
    addProductToCompanyCategory: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        { categoryId, productId }: { categoryId: string; productId: string }
      ): Promise<ProductModel | null> => {
        const product: ProductModel | null = await ProductModel.findOne({
          where: { id: productId }
        });
        const category: CompanyProductsCategoryModel | null = await CompanyProductsCategoryModel.findOne(
          {
            where: { id: categoryId }
          }
        );
        if (product) {
          if (category) {
            if (category.companyId != product.companyId)
              throw new ApolloError(
                "This product is not owned by this company.",
                "403"
              );
            ProductModel.update(
              { companyProductsCategoryId: categoryId },
              { where: { id: productId } }
            );
            return product;
          } else throw new ApolloError("Category not found", "404");
        } else throw new ApolloError("Product not found", "404");
      }
    ),
    removeProductFromCompanyCategory: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        { productId }: { productId: string }
      ): Promise<ProductModel | null> => {
        const product: ProductModel | null = await ProductModel.findOne({
          where: { id: productId },
          include: [CompanyProductsCategoryModel]
        });
        if (product && product.companyProductsCategoryId !== null) {
          ProductModel.update(
            { companyProductsCategoryId: null },
            { where: { id: productId } }
          );
          return product;
        } else
          throw new ApolloError(
            "This product is not in any category of products",
            "404"
          );
      }
    ),
    updateCompanyProductsCategory: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        args: { categoryId: string; name?: string }
      ): Promise<CompanyProductsCategoryModel> => {
        if (args.categoryId === undefined)
          throw new ApolloError("You should select a category", "400");
        const companyProductsCategory: [
          number,
          CompanyProductsCategoryModel[]
        ] = await CompanyProductsCategoryModel.update(
          {
            ...args
          },
          {
            where: { id: args.categoryId },
            returning: true
          }
        );
        return companyProductsCategory[1][0];
      }
    )
  }
};
