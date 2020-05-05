import { gql } from "apollo-server";

export default gql`
  extend type Query {
    getAllCompanyTags: [CompanyTag]!
    getCompanyTag(companyTagId: String, slugName: String): CompanyTag
  }
  extend type Mutation {
    createCompanyTag(name: String!, color: String!): CompanyTag!
    deleteCompanyTag(companyTagId: String!): CompanyTag!
    addTagToCompany(companyTagId: String!, companyId: String!): Company!
    deleteTagFromCompany(companyTagId: String!, companyId: String!): Company!
  }
  type CompanyTag {
    id: String!
    slugName: String!
    translationKey: String!
    color: String!
  }
`;
