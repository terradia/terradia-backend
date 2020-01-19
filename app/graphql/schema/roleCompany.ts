import { gql } from "apollo-server";

export default gql`
  extend type Mutation {
    createRoleCompany(
      companyId: String
      userId: String
      role: Strin
    ): RoleCompany
  }

  type RoleCompany {
    companyId: String!
    userId: String!
    role: String!
  }
`;