import UserModel from "../../database/models/user.model";
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated, isUserAndCustomer } from "./authorization";
import ProductModel from "../../database/models/product.model";
import CustomerModel from "../../database/models/customer.model";
import CompanyModel from "../../database/models/company.model";
import { ApolloError } from "apollo-server-errors";
import OrderHistoryModel from "../../database/models/order-history.model";
import OrderProductHistoryModel from "../../database/models/order-product-history.model";
import { Op } from "sequelize";
import { WhereOptions } from "sequelize/types/lib/model";
import sequelize from "../../database/models";

interface Context {
  user: UserModel;
}

export const OrderHistoryIncludes = [
  { model: OrderProductHistoryModel, include: [ProductModel] },
  CustomerModel,
  CompanyModel
];

// getCompanyOrderHistories(
//   companyId: ID!
// status: String
// limit: Int = 10
// offset: Int = 0
// beginDate: Date
// endDate: Date
// ): [OrderHistory]

export default {
  Query: {
    getOrderHistory: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        { id }: { id: string },
        { user }: Context
      ): Promise<OrderHistoryModel> => {
        const orderHistory = await OrderHistoryModel.findOne({
          where: { id },
          include: OrderHistoryIncludes
        });
        if (!orderHistory)
          throw new ApolloError("Cannot find orderHistory", "404");
        if (user.customer.id !== orderHistory.customerId)
          throw new ApolloError(
            "This is not one of your order histories",
            "404"
          );
        return orderHistory;
      }
    ),
    getMyOrderHistories: combineResolvers(
      isUserAndCustomer,
      async (
        _: any,
        { status }: { status?: string },
        { user }: Context
      ): Promise<OrderHistoryModel[]> => {
        let whereCondition = {};
        if (status) {
          whereCondition = { customerId: user.customer.id, status };
        } else {
          whereCondition = { customerId: user.customer.id };
        }
        return OrderHistoryModel.findAll({
          where: whereCondition as WhereOptions,
          include: OrderHistoryIncludes
        });
      }
    ),
    getCompanyOrderHistories: combineResolvers(
      isUserAndCustomer,
      async (
        _: any,
        {
          companyId,
          status,
          limit,
          offset,
          fromDate,
          toDate
        }: {
          companyId: string;
          status?: string;
          limit?: number;
          offset?: number;
          fromDate?: Date;
          toDate?: Date;
        }
      ): Promise<OrderHistoryModel[]> => {
        const whereCondition: {
          companyId: string;
          status?: string;
          createdAt?: any;
        } = {
          companyId,
          status
        };
        if (fromDate && toDate) {
          whereCondition["createdAt"] = { [Op.between]: [fromDate, toDate] };
        } else if (fromDate && !toDate) {
          whereCondition["createdAt"] = { [Op.gte]: fromDate };
        } else if (!fromDate && toDate) {
          whereCondition["createdAt"] = { [Op.lte]: toDate };
        }
        return OrderHistoryModel.findAll({
          where: whereCondition as WhereOptions,
          include: OrderHistoryIncludes,
          limit,
          offset
        });
      }
    )
  },
  Mutation: {}
};
