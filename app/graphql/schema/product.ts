import { gql } from "apollo-server";

export default gql`
  extend type Query {
    getAllProducts: [Product]!
    getProduct(id: ID!): Product!
    getProductsByCompany(companyId: String): [Product]!
    getProductsByCompanyByCategory(companyId: String): [Category]!
  }
  extend type Mutation {
    createProduct(name: String!, description: String!, companyId: String!): Product!
    addCategoryToProduct(categoryName: String!, productId: String!): Product!
  }
  type Product {
    id: ID!
    name: String!
    image: String
    description: String!
    categories: [Category]
    createdAt: Date
    updatedAt: Date
    company: Company
    companyProductsCategory: CompanyProductsCategory
  }
`;
