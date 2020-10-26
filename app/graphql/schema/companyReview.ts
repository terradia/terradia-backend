import { gql } from "apollo-server";

export default gql`
  extend type Mutation {
    createCompanyReview(
      title: String
      customerMark: Int!
      description: String
      companyId: String!
    ): CompanyReview
  }
  extend type Query {
    getCompanyReviews(id: ID!, limit: Int!, offset: Int!): [CompanyReview]
  }

  type CompanyReview {
    id: String!
    title: String!
    description: String
    customerMark: Int!
    customer: Customer
    company: Company
    createdAt: Date
    updatedAt: Date
  }
`;
