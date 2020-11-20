import { gql } from "apollo-server";

export default gql`
  extend type Mutation {
    createOrderHistoryReview(
      comment: String
      customerMark: Int!
      orderHistoryId: ID!
    ): OrderHistoryReview
  }

  type OrderHistoryReview {
    id: String!
    comment: String
    customerMark: Int!
    customer: Customer
    createdAt: Date
  }
`;
