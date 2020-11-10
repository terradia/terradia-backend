import CustomerModel from "../../database/models/customer.model";
import UserModel from "../../database/models/user.model";
import CompanyReviewModel from "../../database/models/company-review.model";
import CompanyModel from "../../database/models/company.model";
import CustomersFavoriteCompaniesModel from "../../database/models/customers-favorite-companies.model";
import { ApolloError } from "apollo-server";
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated, isUserAndCustomer } from "./authorization";

interface FavoriteArgs {
  companyId: string;
}

interface Context {
  user: UserModel;
}

export default {
  Query: {
    getAllCustomers: async (): Promise<CustomerModel[]> => {
      return CustomerModel.findAll({
        include: [UserModel, CompanyReviewModel, CompanyModel]
      });
    },
    getCustomer: async (
      _: any,
      { userId }: { userId: string }
    ): Promise<CustomerModel | null> => {
      return CustomerModel.findOne({
        where: { userId },
        include: [UserModel, CompanyReviewModel, CompanyModel]
      });
    },
    getCustomerFavoriteCompanies: async (
      _: any,
      { userId }: { userId: string },
      { user }: Context
    ) => {
      const id = userId ? userId : user.id;
      const customer: CustomerModel | null = await CustomerModel.findOne({
        where: { userId: id },
        include: [UserModel, CompanyReviewModel, CompanyModel]
      });
      return customer?.favoriteCompanies;
    }
  },
  Mutation: {
    defineUserAsCustomer: async (_: any, { userId }: { userId: string }) => {
      const [result] = await CustomerModel.findOrCreate({
        where: { userId },
        defaults: {
          userId
        }
      });
      return CustomerModel.findOne({
        where: { id: result.id },
        include: [UserModel]
      });
    },
    addFavoriteCompany: combineResolvers(
      isUserAndCustomer,
      async (
        _: any,
        { companyId }: FavoriteArgs,
        { user }: Context
      ): Promise<CustomerModel | null> => {
        const company: CompanyModel | null = await CompanyModel.findOne({
          where: { id: companyId }
        });
        const customerId: string = user.customer.id;
        if (company) {
          await CustomersFavoriteCompaniesModel.findOrCreate({
            where: { companyId, customerId }
          });
        } else {
          throw new ApolloError(
            "CompanyNotFound",
            "RESOURCE_NOT_FOUND"
          );
        }
        return CustomerModel.findByPk(customerId, {
          include: [CompanyModel, CompanyReviewModel, UserModel]
        });
      }
    ),
    removeFavoriteCompany: combineResolvers(
      isUserAndCustomer,
      async (
        _: any,
        { companyId }: FavoriteArgs,
        { user }: Context
      ): Promise<CustomerModel | null> => {
        if (!user.customer)
          throw new ApolloError("NotACustomer", "500");
        const company: CompanyModel | null = await CompanyModel.findByPk(
          companyId
        );
        const customerId: string = user.customer.id;
        if (company) {
          await CustomersFavoriteCompaniesModel.destroy({
            where: { companyId, customerId }
          });
        } else {
          throw new Error("This company does not exists.");
        }
        return CustomerModel.findByPk(customerId, {
          include: [CompanyModel, CompanyReviewModel, UserModel]
        });
      }
    )
  }
};
