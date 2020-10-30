import UserModel from "../../database/models/user.model";
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated, isUserAndCustomer } from "./authorization";
import OrderModel from "../../database/models/order.model";
import OrderProductModel from "../../database/models/order-product.model";
import ProductModel from "../../database/models/product.model";
import CustomerModel from "../../database/models/customer.model";
import CompanyModel from "../../database/models/company.model";
import CompanyImageModel from "../../database/models/company-image.model";
import { ApolloError } from "apollo-server-errors";
import OrderHistoryModel from "../../database/models/order-history.model";
import OrderProductHistoryModel from "../../database/models/order-product-history.model";

interface Context {
  user: UserModel;
}

export const OrderIncludes = [
  { model: OrderProductModel, include: [ProductModel] },
  CustomerModel,
  { model: CompanyModel, include: [{ model: CompanyImageModel, as: "logo" }] }
];

const OrderHistoryIncludes = [
  { model: OrderProductHistoryModel, include: [ProductModel] },
  CustomerModel,
  CompanyModel
];

export default {
  Query: {
    getMyOrders: combineResolvers(
      isUserAndCustomer,
      (
        _: any,
        { status = "PENDING" }: { status?: string },
        { user }: Context
      ): Promise<OrderModel[]> => {
        return OrderModel.findAll({
          where: { customerId: user.customer.id, status },
          include: OrderIncludes
        });
      }
    ),
    getOrder: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        { id }: { id: string },
        { user }: Context
      ): Promise<OrderModel | null> => {
        const order = await OrderModel.findOne({
          where: { id: id },
          include: OrderIncludes
        });
        if (!order) throw new ApolloError("Order not found", "40#");
        if (order.customerId !== user.customer.id)
          throw new ApolloError("This is not one of your orders", "403");
        return order;
      }
    ),
    getCurrentOrders: combineResolvers(
      isAuthenticated,
      (
        _: any,
        {
          companyId,
          status = "PENDING"
        }: { companyId: string; status: string },
        __: Context
      ): Promise<OrderModel[]> => {
        return OrderModel.findAll({
          where: { companyId, status },
          include: OrderIncludes
        });
      }
    )
  },
  Mutation: {
    cancelOrder: combineResolvers(
      isUserAndCustomer,
      async (
        _: any,
        { id }: { id: string },
        __: Context
      ): Promise<OrderModel | null> => {
        const order = await OrderModel.findOne({
          where: { id },
          include: OrderIncludes
        });

        if (!order) throw new ApolloError("This order doesn't exist", "404");
        if (order.status !== "PENDING")
          throw new ApolloError(
            "The order isn't pending, you cannot cancel it",
            "401"
          );

        // TODO : cancel the payment on stripe

        // TODO : send mail to the user

        // the order will be removed automatically after 24h
        await OrderModel.update(
          { status: "CANCELED" },
          { where: { id }, returning: true }
        );

        return OrderModel.findOne({
          where: { id: order.id },
          include: OrderIncludes
        });
      }
    ),
    receiveOrder: combineResolvers(
      isUserAndCustomer,
      async (
        _: any,
        { id }: { id: string },
        __: Context
      ): Promise<OrderHistoryModel | null> => {
        const order = await OrderModel.findOne({
          where: { id },
          include: OrderIncludes
        });

        if (!order) throw new ApolloError("This order doesn't exist", "404");
        if (order.status !== "AVAILABLE")
          throw new ApolloError("Order wasn't validated", "401");

        const historyStatus =
          order.status === "AVAILABLE" ? "FINISHED" : order.status;

        // transform Order in OrderHistory
        const orderHistory = await OrderHistoryModel.create(
          {
            code: order.code,
            companyName: order.company.name,
            companyLogo: order.company.logo,
            companyAddress: order.company.address,
            status: historyStatus,
            price: order.price,
            numberProducts: order.numberProducts,
            decliningReason: order.decliningReason,
            companyId: order.companyId,
            customerId: order.customerId,
          },
          {}
        );
        // Create all the OrderProductHistory with all data
        order.products.map(async (orderProduct: OrderProductModel) => {
          await OrderProductHistoryModel.create({
            orderHistoryId: orderHistory.id,
            productId: orderProduct.product.id,
            name: orderProduct.product.name,
            quantity: orderProduct.quantity,
            price: orderProduct.price,
            unitId: orderProduct.product.unitId,
            quantityForUnit: orderProduct.product.quantityForUnit
          });
        });
        // destroy Order
        OrderModel.destroy({ where: { id: order.id } });

        // TODO : send mail to the user

        return OrderHistoryModel.findOne({
          where: { id: orderHistory.id },
          include: OrderHistoryIncludes
        });
      }
    ),
    acceptOrder: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        { id }: { id: string },
        __: Context
      ): Promise<OrderModel | null> => {
        const order = await OrderModel.findOne({
          where: { id },
          include: OrderIncludes
        });
        if (!order) throw new ApolloError("This order doesn't exist", "404");
        if (order.status !== "PENDING")
          throw new ApolloError(
            "The order isn't pending, you cannot accept it",
            "401"
          );

        // TODO : request payment with stripe

        // TODO : send mail to the user

        // TODO : change the status of the order to "AVAILABLE"
        const returnValues = await OrderModel.update(
          { status: "AVAILABLE" },
          { where: { id }, returning: true }
        );
        return OrderModel.findOne({
          where: { id: order.id },
          include: OrderIncludes
        });
      }
    ),
    declineOrder: combineResolvers(
      isUserAndCustomer,
      async (
        _: any,
        { id, reason }: { id: string; reason: string },
        __: Context
      ): Promise<OrderModel | null> => {
        const order = await OrderModel.findOne({
          where: { id },
          include: OrderIncludes
        });
        if (!order) throw new ApolloError("This order doesn't exist", "404");
        if (order.status !== "PENDING")
          throw new ApolloError(
            "Cannot decline order that is not pending",
            "401"
          );

        // TODO : cancel payment on stripe

        // TODO : send mail to the user
        const returnValues = await OrderModel.update(
          { status: "DECLINED", decliningReason: reason },
          { where: { id }, returning: true }
        );
        return OrderModel.findOne({
          where: { id: order.id },
          include: OrderIncludes
        });
      }
    )
  }
};
