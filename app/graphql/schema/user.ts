import { gql } from "apollo-server";

export default gql`
  extend type Query {
    getAllUsers: [User]!
    doesFacebookAccountExistWithEmail(facebookToken: String!): Boolean!
    getUser: User
    getMyCompaniesInvitations(
      status: CompanyUserInvitationStatusRequest = "ALL"
    ): [CompanyUserInvitation!]
  }
  extend type Mutation {
    register(
      firstName: String!
      lastName: String!
      password: String!
      email: String!
      phone: String
      defineUserAsCustomer: Boolean
      exponentPushToken: String
    ): SignupAnswer!
    login(
      email: String!
      password: String!
      exponentPushToken: String
    ): SigninAnswer!
    updateUser(
      email: String
      firstName: String
      lastName: String
      phone: String
      password: String
    ): User!
    updateUserAvatar(avatar: Upload!): User
    signInWithFacebook(
      facebookToken: String!
      exponentPushToken: String
    ): SigninAnswer!
    signUpWithFacebook(
      facebookToken: String!
      exponentPushToken: String
      defineUserAsCostumer: Boolean
    ): SignupAnswer!
    generateCodePasswordForgot(email: String!): Boolean
    signInWithgeneratedCode(
      email: String!
      code: String!
      exponentPushToken: String
    ): SigninAnswer!
    deleteUser(password: String): User!
    passwordValidation(password: String!): Boolean
    updateMailsNotifications: User!
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
    firstName: String!
    lastName: String!
    email: String!
    password: String!
    phone: String!
    validated: Boolean
    avatar: String
    # Company Management related
    companies: [CompanyUser]

    # Customer related
    customer: Customer
    createdAt: Date
    archivedAt: Date
    mailsNotifications: Boolean

    expoPushToken: String
  }
`;
