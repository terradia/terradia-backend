import { gql } from "apollo-server";

export default gql`
  extend type Query {
    getCompanyImages(companyId: ID, page: Int, pageSize: Int): [CompanyImages]
  }
  extend type Mutation {
    addCompanyImages(images: [Upload]!, companyId: ID!): [CompanyImages]
    removeCompanyImage(imagesId: ID!): [CompanyImages]
  }
  type CompanyImages {
    id: ID!
    filename: String
    createdAt: Date
    updatedAt: Date
  }
`;
