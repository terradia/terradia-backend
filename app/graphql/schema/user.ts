import { gql } from 'apollo-server';

export default gql`
  extend type Query {
    getUser: User!
  }
  extend type Mutation {
    login(email: String, password: String): SigninAnswer!
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
  }
`;