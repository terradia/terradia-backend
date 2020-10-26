import { gql } from "apollo-server";

export default gql`
  extend type Query {
    # Customer Queries
    getMyOrders(status: String = "PENDING"): [Order]
    getOrder(id: ID!): Order

    # Company Queries
    getCurrentOrders(companyId: ID!, status: String = "PENDING"): [Order]
  }
  extend type Mutation {
    cancelOrder(id: ID!): Order
    receiveOrder(id: ID!): OrderHistory

    acceptOrder(id: ID!): Order
    declineOrder(id: ID!, reason: String): Order
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
