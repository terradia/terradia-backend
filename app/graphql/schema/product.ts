import { gql } from 'apollo-server';

export default gql`
  extend type Query {
    getAllProducts: [Product]!
    getProduct(id: ID!): Product!
  }
  extend type Mutation {
    createProduct(name: String!, description: String!): Product!
    addCategoryToProduct(categoryName: String!, productId: String!): Product!
  }
  
  type Product {
    id: ID!
    name: String!
    description: String!
    categories: [Category]
  }
  type Category {
    id: Int!
    name: String!
    parentCategoryId: Int
    products: [Product]
  }
`;