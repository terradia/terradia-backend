import {gql} from "apollo-server";

export default gql`
    type CompanyUser {
        id: String!
        company: Company
        user: User
        roles: [Role]
    }
`;
