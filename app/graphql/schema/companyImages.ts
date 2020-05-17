import { gql } from "apollo-server";

export default gql`
  extend type Query {
    getCompanyImages(companyId: ID, page: Int, pageSize: Int): [CompanyImage]
  }
  extend type Mutation {
    addCompanyImages(
      images: [Upload]!
      companyId: ID!
      names: [String]
    ): [CompanyImage]
    addCompanyImage(image: Upload!, companyId: ID!, name: String): CompanyImage
    removeCompanyImages(imagesId: [ID]!): [CompanyImage]
    removeCompanyImage(imageId: ID!): CompanyImage
    updateCompanyImageName(imageId: ID!, name: String!): CompanyImage
  }
  type CompanyImage {
    id: ID!
    name: String
    filename: String
    createdAt: Date
    updatedAt: Date
    products: [Product]
  }
`;
