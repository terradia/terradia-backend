import { gql } from 'apollo-server';

export default gql`
  extend type Query {
    getUser: User!
  }
  extend type Mutation {
    register(
      firstName: String!
      lastName: String!
      password: String!
      email: String!
      phone: String
    ): SignupAnswer!
  }
  type SignupAnswer {
    token: String!
    message: String!
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
  }
`;