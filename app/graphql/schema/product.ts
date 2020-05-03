import { gql } from "apollo-server";

export default gql`
  extend type Query {
    getAllProducts: [Product]!
    getProduct(id: ID!): Product!
    getProductsByCompany(companyId: String): [Product]!
    getProductsByCompanyByCategory(companyId: String): [Category]!
    getAllUnits(referencesOnly: Boolean): [Unit]!
    getUnit(id: ID, notation: String, name: String): Unit!
  }
  extend type Mutation {
    createProduct(
      name: String!
      description: String!
      companyId: String!
      price: Float!
      quantityForUnit: Int
      unitId: String
      companyProductsCategoryId: String
    ): Product!
    addCategoryToProduct(categoryName: String!, productId: String!): Product!
    updateProduct(
      productId: String
      name: String
      description: String
      image: String
      unitId: String
      quantityForUnit: Float
      price: Float
    ): Product
    deleteProduct(productId: String!): Int
    updateProductsPosition(productsPositions: [ProductPosition!]): Boolean
  }
  #Type => ['addCategory', 'deleteCategory', 'moveCategory']
  input ProductPosition {
    productId: ID!
    position: Int!
    categoryId: ID
    type: String
  }

  type Product {
    # Resouce related data
    id: ID!
    name: String!
    description: String!
    image: String
    position: Int

    createdAt: Date
    updatedAt: Date

    # Classification data
    categories: [Category]
    company: Company
    companyProductsCategory: CompanyProductsCategory

    # Customers filled
    reviews: [ProductReview]
    averageMark: Float
    numberOfMarks: Int
    customerCartProducts: [CartProduct]

    # Pricing
    unit: Unit!
    quantityForUnit: Float!
    price: Float!
  }
  type Unit {
    id: ID!
    name: String!
    notation: String!
    referenceUnit: Unit
    multiplicationFactor: Float
  }
`;
