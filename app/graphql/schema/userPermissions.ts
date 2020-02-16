import {gql} from "apollo-server";

export default gql`
    type UserPermissions {
        id: String!
        createCompany: Boolean,
    }
`;
