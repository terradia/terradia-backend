import { gql } from "apollo-server";

export default gql`
  extend type Query {
    # Customer Only Queries
    getMyOrders(status: String): [Order]
    getOrder(id: ID!): Order
    getMyOrderHistories(status: String): [OrderHistory]
    getOrderHistory(id: ID!): OrderHistory

    # Company Queries
    getCurrentOrders(
      companyId: ID!
      status: String
      limit: Int = 10
      offset: Int = 0
    ): [Order]
    getCompanyOrderHistories(
      companyId: ID!
      status: String
      limit: Int = 10
      offset: Int = 0
      fromDate: Date
      toDate: Date
    ): [OrderHistory]
  }
  extend type Mutation {
    cancelOrder(id: ID!): OrderHistory
    receiveOrder(id: ID!): OrderHistory

    acceptOrder(id: ID!): Order
    declineOrder(id: ID!, reason: String): OrderHistory
  }
  type Order {
    id: String!
    code: String!
    customer: Customer!
    company: Company!
    products: [OrderProduct]
    createdAt: Date!
    updatedAt: Date!
    price: Float!
    numberProducts: Int!
    status: OrderStatus!
    decliningReason: String
  }
  type OrderProduct {
    id: String!
    product: Product!
    order: Order!
    quantity: Int!
    price: Float!
  }

  enum OrderStatus {
    PENDING
    ACCEPTED
    AVAILABLE
    DECLINED
    CANCELED
  }

  type OrderHistory {
    id: ID!
    code: String!
    customerId: String
    companyId: String
    companyName: String
    companyLogo: String
    companyAddress: String
    products: [OrderProductHistory]
    createdAt: Date!
    updatedAt: Date!
    price: Float!
    numberProducts: Int!
    decliningReason: String
    status: OrderHistoryStatus
    orderCreationDate: Date!
  }

  type OrderProductHistory {
    id: ID!
    orderHistory: OrderHistory
    productId: String
    name: String
    quantity: Int
    price: Float!
    unit: Unit!
    quantityForUnit: Int
  }

  enum OrderHistoryStatus {
    FINISHED
    DECLINED
    CANCELED
  }
`;
