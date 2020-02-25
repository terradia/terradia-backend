import {gql} from "apollo-server";

export default gql`
    extend type Mutation {
        addUserCompanyRole(companyUserId: String!, roleId: String!): CompanyUser!
        removeUserCompanyRole(companyUserId: String!, roleId: String!): CompanyUser!
    }
    type Role {
        id: String!
        translationKey: String,
        slugName: String
        userPermission: UserPermissions
    }
`;
