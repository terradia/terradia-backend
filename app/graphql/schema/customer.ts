import { gql } from "apollo-server";

export default gql`
  extend type Query {
    getAllCustomers: [Customer]
    getCustomer(userId: String!): Customer
  }

  extend type Mutation {
    defineUserAsCustomer(userId: String!): Customer
    addFavoriteCompany(companyId: String!): Customer
    removeFavoriteCompany(companyId: String!): Customer
  }

  type Customer {
    id: String!
    user: User!
    companyReviews: [CompanyReview]
    favoriteCompanies: [Company]
  }
`;
