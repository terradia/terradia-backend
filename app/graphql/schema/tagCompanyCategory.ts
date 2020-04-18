import { gql } from "apollo-server";

export default gql`
  extend type Query {
    getAllTagCompany: [TagCompany]!
    getTagCompanyByName(name: String!): TagCompany
  }
  extend type Mutation {
    createTagCompany(name: String!): TagCompany!
    deleteTag(id: String!): TagCompany!
    addTagToCompany(tagName: String!, companyId: String!): Company!
    deleteTagToCompany(tagName: String!, companyId: String!): Company!
  }
  type TagCompany {
    id: String!
    name: String!
    company: [Company]
  }
`;
