import { gql } from "apollo-server";

export default gql`
  extend type Mutation {
    addReplyToProductReview(reply: String, reviewId: String!): ProductReview
    createProductReview(
      title: String
      customerMark: Int!
      description: String
      productId: String!
    ): ProductReview
    deleteProductReply(reviewId: String!): ProductReview
  }

  extend type Query {
    getProductReviews(id: ID!, limit: Int!, offset: Int!): [ProductReview]
  }

  type ProductReview {
    id: String!
    title: String!
    description: String
    customerMark: Int!
    customer: Customer
    product: Product
    reply: String
    createdAt: Date
    updatedAt: Date
  }
`;
