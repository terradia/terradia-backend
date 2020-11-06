import { gql } from "apollo-server";

export default gql`
  extend type Query {
    # find by product or by company, or both, one of the two minimum
    getCompanyProductAdvises(
      companyId: ID
      productId: ID
      offset: Int
      limit: Int
    ): [CompanyProductAdvise]
    getProductAdvise(id: ID!): CompanyProductAdvise
  }
  extend type Mutation {
    createCompanyProductAdvise(
      productId: ID!
      companyId: ID!
      title: String!
      content: String!
    ): CompanyProductAdvise
    updateCompanyProductAdvise(
      id: ID!
      title: String
      content: String
    ): CompanyProductAdvise
    deleteCompanyProductAdvise(id: ID!): CompanyProductAdvise
  }

  type CompanyProductAdvise {
    id: ID!
    company: Company
    product: Product
    title: String
    content: String
    createdAt: Date
    updatedAt: Date
  }
`;
