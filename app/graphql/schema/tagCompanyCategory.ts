import { gql } from "apollo-server";

export default gql`
  extend type Query {
    getAllTagCompanyCategories: [TagCompany]!
    getTagCompanyCategoryByName(name: String!): TagCompany
  }
  extend type Mutation {
    createTagCompanyCategory(name: String!, parentCategoryId: String): TagCompany!
    deleteTagCompanyCategory(id: String!): TagCompany!
  }
  type TagCompany {
    id: String!
    name: String!
    parentCategoryId: String
    company: [Company]
  }
`;
