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
      coverId: String
      quantityForUnit: Int
      unitId: String
      companyProductsCategoryId: String
    ): Product!

    addCategoryToProduct(categoryName: String!, productId: String!): Product!

    updateProduct(
      productId: String!
      name: String
      description: String
      unitId: String
      quantityForUnit: Float
      price: Float
      coverId: String
    ): Product

    deleteProduct(productId: String!): Int

    updateProductsPosition(productsPositions: [ProductPosition!]): Boolean

    addImageToProduct(
      companyImageId: String!
      productId: String!
      isCover: Boolean
    ): CompanyImage
    uploadImageOfProduct(
      image: Upload!
      productId: String!
      isCover: Boolean
    ): CompanyImage
    deleteImageFromProduct(
      companyImageId: String!
      productId: String!
    ): CompanyImage
    updateProductCover(companyImageId: String!, productId: String!): Product
  }
  #Type => ['addCategory', 'deleteCategory', 'moveCategory']
  input ProductPosition {
    productId: ID!
    position: Int!
    categoryId: ID
    type: String
  }
  type CompanyProductImage {
    companyImage: CompanyImage!
  }
  type Product {
    # Resource related data
    id: ID!
    name: String!
    description: String!
    position: Int # position in the category of the company

    # Images
    cover: CompanyProductImage
    images: [CompanyImage]

    # Date Related
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
    customerBasketProducts: [CartProduct]

    # Pricing
    unit: Unit
    quantityForUnit: Float!
    price: Float!
      
    advises: [CompanyProductAdvise]
    numberAdvises: Int
  }
  type Unit {
    id: ID!
    name: String!
    notation: String!
    referenceUnit: Unit
    multiplicationFactor: Float
  }
`;
