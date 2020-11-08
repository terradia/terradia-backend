import { gql } from "apollo-server";

export default gql`
  extend type Query {
    getAllCustomers: [Customer]
    getCustomer(userId: String!): Customer
    getCustomerFavoriteCompanies(userId: String): [Company]
  }

  extend type Mutation {
    defineUserAsCustomer(userId: String!): Customer
    addFavoriteCompany(companyId: String!): Customer
    removeFavoriteCompany(companyId: String!): Customer
  }

  type Customer {
    id: String!
    user: User
    companyReviews: [CompanyReview]
    favoriteCompanies: [Company]

    # Ordering related data
    cart: Cart
    # orders
    orders: [Order]
    ordersHistory: [OrderHistory]
    # receipts
  }
`;
