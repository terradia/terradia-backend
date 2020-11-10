import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated, isUserInCompany } from "./authorization";
import { ApolloError, ForbiddenError } from "apollo-server";
import CompanyProductAdviseModel from "../../database/models/company-product-advise.model";
import ProductModel from "../../database/models/product.model";
import CompanyModel from "../../database/models/company.model";
import UserModel from "../../database/models/user.model";
import { WhereOptions } from "sequelize/types/lib/model";

export const CompanyProductAdviseIncludes = [ProductModel, CompanyModel];

export default {
  Query: {
    getCompanyProductAdvises: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        {
          companyId,
          productId,
          offset,
          limit
        }: {
          companyId: string;
          productId: string;
          offset: number;
          limit: number;
        }
      ): Promise<CompanyProductAdviseModel[]> => {
        if (!companyId && !productId) throw new ApolloError("NoFilter", "401");
        const where: WhereOptions = {};
        if (productId) where["productId"] = productId;
        if (companyId) where["companyId"] = companyId;
        return CompanyProductAdviseModel.findAll({
          where,
          include: CompanyProductAdviseIncludes,
          limit,
          offset,
          order: [["createdAt", "DESC"]]
        });
      }
    ),
    getProductAdvise: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        {
          id
        }: {
          id: string;
        }
      ): Promise<CompanyProductAdviseModel | null> => {
        return CompanyProductAdviseModel.findOne({
          where: {
            id
          },
          include: CompanyProductAdviseIncludes
        });
      }
    )
  },
  Mutation: {
    createCompanyProductAdvise: combineResolvers(
      isUserInCompany,
      async (
        _: any,
        {
          companyId,
          productId,
          title,
          content
        }: {
          companyId: string;
          productId: string;
          title: string;
          content: string;
        }
      ): Promise<CompanyProductAdviseModel | null> => {
        const company = await CompanyModel.findOne({
          where: { id: companyId }
        });
        if (!company) throw new ApolloError("CompanyNotFound", "404");
        const product = await ProductModel.findOne({
          where: { id: productId, companyId }
        });
        if (!product) throw new ApolloError("ProductNotFound", "404");

        await ProductModel.update(
          { numberAdvises: product.numberAdvises + 1 },
          { where: { id: productId } }
        );

        return CompanyProductAdviseModel.create({
          companyId,
          productId,
          title,
          content
        });
      }
    ),
    updateCompanyProductAdvise: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        {
          id,
          title,
          content
        }: {
          id: string;
          title?: string;
          content?: string;
        },
        { user: { companies } }: { user: UserModel }
      ): Promise<CompanyProductAdviseModel> => {
        const advise = await CompanyProductAdviseModel.findOne({
          where: { id }
        });
        if (!advise) throw new ApolloError("AdviseNotFound", "404");
        if (companies.findIndex(e => e.companyId === advise.companyId) === -1)
          throw new ForbiddenError("AccessDenied");

        await CompanyProductAdviseModel.update(
          {
            title,
            content
          },
          { where: { id } }
        );
        const adviseReturn = await CompanyProductAdviseModel.findOne({
          where: { id },
          include: CompanyProductAdviseIncludes
        });
        if (!adviseReturn) throw new ApolloError("AdviseNotFound", "404");
        return adviseReturn;
      }
    ),
    deleteCompanyProductAdvise: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        {
          id,
          title,
          content
        }: {
          id: string;
          title?: string;
          content?: string;
        },
        { user: { companies } }: { user: UserModel }
      ): Promise<CompanyProductAdviseModel> => {
        const advise = await CompanyProductAdviseModel.findOne({
          where: { id }
        });
        if (!advise) throw new ApolloError("AdviseNotFound", "404");
        if (companies.findIndex(e => e.companyId === advise.companyId) === -1)
          throw new ForbiddenError("AccessDenied");

        const product = await ProductModel.findOne({
          where: { id: advise.productId }
        });
        if (!product) throw new ApolloError("ProductNotFound", "404");
        await ProductModel.update(
          { numberAdvises: product.numberAdvises - 1 },
          { where: { id: advise.productId } }
        );

        CompanyProductAdviseModel.destroy({ where: { id } });
        return advise;
      }
    )
  }
};
