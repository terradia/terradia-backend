import CustomerModel from "../../database/models/customer.model";
import UserModel from "../../database/models/user.model";
import CompanyReviewModel from "../../database/models/company-review.model";
import CompanyModel from "../../database/models/company.model";
import CustomersFavoriteCompaniesModel from "../../database/models/customers-favorite-companies.model";
import { ApolloError } from "apollo-server";

interface FavoriteArgs {
  companyId: string;
}

interface Context {
  user: UserModel;
}

export default {
  Query: {
    getAllCustomers: async () => {
      return CustomerModel.findAll({
        include: [UserModel, CompanyReviewModel, CompanyModel]
      });
    },
    getCustomer: async (_parent, { userId }) => {
      return CustomerModel.findOne({
        where: { userId },
        include: [UserModel, CompanyReviewModel, CompanyModel]
      });
    },
    getCustomerFavoriteCompanies: async (_parent, { userId }, { user }) => {
      let id = userId ? userId : user.id;
      const customer = await CustomerModel.findOne({
        where: { userId: id },
        include: [UserModel, CompanyReviewModel, CompanyModel]
      });
      return customer.favoriteCompanies;
    }
  },
  Mutation: {
    defineUserAsCustomer: async (_parent, { userId }) => {
      const customer = await CustomerModel.findOne({
        where: { userId },
        include: [UserModel]
      });

      if (customer) {
        return customer;
      } else {
        return CustomerModel.create().then(customer => {
          customer.setUser(userId);
          return customer;
        });
      }
    },
    addFavoriteCompany: async (
      _parent,
      { companyId }: FavoriteArgs,
      { user }: Context
    ) => {
      const company = await CompanyModel.findOne({ where: { id: companyId } });
      const customerId = user.customer.id;
      if (company) {
        await CustomersFavoriteCompaniesModel.findOrCreate({
          where: { companyId, customerId }
        });
      } else {
        throw new ApolloError(
          "This company does not exists.",
          "RESOURCE_NOT_FOUND"
        );
      }
      return CustomerModel.findByPk(customerId, { include: [CompanyModel] });
    },
    removeFavoriteCompany: async (
      _parent,
      { companyId }: FavoriteArgs,
      { user }: Context
    ) => {
      const company = CompanyModel.findByPk(companyId);
      const customerId = user.customer.id;
      if (company) {
        await CustomersFavoriteCompaniesModel.destroy({
          where: { companyId, customerId }
        });
      } else throw new Error("This company does not exists.");
      return user.customer;
    }
  }
};
