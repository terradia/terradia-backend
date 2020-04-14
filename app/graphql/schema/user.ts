import { gql } from "apollo-server";

export default gql`
  extend type Query {
    getUser: User
    doesFacebookAccountExistWithEmail(facebookToken: String!): Boolean!
  }
  extend type Mutation {
    register(
      firstName: String!
      lastName: String!
      password: String!
      email: String!
      phone: String
      defineUserAsCostumer: Boolean
    ): SignupAnswer!
    login(email: String!, password: String!): SigninAnswer!
    signInWithFacebook(facebookToken: String!, exponentPushToken: String): SigninAnswer!
    signUpWithFacebook(facebookToken: String! , exponentPushToken: String, defineUserAsCostumer: Boolean): SignupAnswer!
  }
  type SignupAnswer {
    token: String!
    message: String!
    userId: String!
  }
  type SigninAnswer {
    token: String!
    userId: String!
  }

  type User {
    id: ID!
    firstName: String
    lastName: String
    email: String!
    password: String
    phone: String!
    validated: Boolean
    companies: [CompanyUser]
    customer: Customer
  }
`;
