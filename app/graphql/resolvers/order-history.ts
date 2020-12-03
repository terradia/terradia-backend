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
import UnitModel from "../../database/models/unit.model";
import OrderHistoryReviewModel from "../../database/models/order-history-review.model";

interface Context {
  user: UserModel;
}

export const OrderHistoryIncludes = [
  {
    model: OrderProductHistoryModel,
    include: [ProductModel, UnitModel]
  },
  CustomerModel,
  CompanyModel,
  OrderHistoryReviewModel
];

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
        const orders = await OrderHistoryModel.findAll({
          where: whereCondition as WhereOptions,
          include: OrderHistoryIncludes,
          order: [["createdAt", "DESC"]]
        });
        return orders;
      }
    ),
    getCompanyOrderHistories: combineResolvers(
      isAuthenticated,
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
          companyId
        };
        if (status) whereCondition["status"] = status;
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
  Mutation: {
    createOrderHistoryReview: combineResolvers(
      isUserAndCustomer,
      async (
        _: any,
        {
          comment,
          customerMark,
          orderHistoryId
        }: {
          comment: string;
          customerMark: number;
          orderHistoryId: string;
        },
        { user }: { user: UserModel }
      ): Promise<OrderHistoryReviewModel | null> => {
        const orderHistory: OrderHistoryModel | null = await OrderHistoryModel.findOne(
          { where: { id: orderHistoryId } }
        );
        if (!orderHistory)
          throw new ApolloError("This OrderHistory does not exists", "404");
        if (user.customer.id !== orderHistory.customerId)
          throw new ApolloError(
            "This is not you of your orderHistories",
            "403"
          );
        const orderHistoryReviewModel: OrderHistoryReviewModel | null = await OrderHistoryReviewModel.findOne(
          { where: { orderHistoryId } }
        );
        if (orderHistoryReviewModel !== null)
          throw new ApolloError("You already rated this orderHistory", "403");
        return OrderHistoryReviewModel.create({
          orderHistoryId,
          comment,
          customerMark
        });
      }
    )
  }
};
