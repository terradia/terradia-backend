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
        if (!companyId && !productId)
          throw new ApolloError(
            "You should have at least the productId or the companyId",
            "401"
          );
        const where: WhereOptions = {};
        if (productId) where["productId"] = productId;
        if (companyId) where["companyId"] = companyId;
        return CompanyProductAdviseModel.findAll({
          where,
          include: CompanyProductAdviseIncludes,
          limit,
          offset
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
        const company = CompanyModel.findOne({ where: { id: companyId } });
        if (!company) throw new ApolloError("Company not found.", "404");
        const product = ProductModel.findOne({
          where: { id: productId, companyId }
        });
        if (!product) throw new ApolloError("Product not found.", "404");

        console.log({ companyId, productId, title, content });

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
        if (!advise) throw new ApolloError("Advise not found.", "404");
        console.log(companies, advise.companyId);
        if (
          companies.findIndex(elem => elem.companyId === advise.companyId) ===
          -1
        )
          throw new ForbiddenError("You are not in this company.");

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
        if (!adviseReturn) throw new ApolloError("ERROR.", "500");
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
        if (!advise) throw new ApolloError("Advise not found.", "404");
        if (
          companies.findIndex(elem => elem.companyId === advise.companyId) ===
          -1
        )
          throw new ForbiddenError("You are not in this company.");

        CompanyProductAdviseModel.destroy({ where: { id } });
        return advise;
      }
    )
  }
};
