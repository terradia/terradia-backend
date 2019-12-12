import { gql } from "apollo-server-azure-functions";

export default gql`
  extend type Query {
    getAllCategories: [Category]!
    getCategoryByName(name: String!): Category
  }
  extend type Mutation {
    createCategory(name: String!, parentCategoryId: String): Category!
    deleteCategory(id: String!): Category!
  }
  type Category {
    id: String!
    name: String!
    parentCategoryId: String
    products: [Product]
  }
`;
