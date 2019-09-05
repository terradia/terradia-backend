import { gql } from 'apollo-server';

export default gql`
  extend type Query {
    getUser: User!
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