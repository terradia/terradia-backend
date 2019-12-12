import {gql} from "apollo-server-azure-functions";

export default gql`
    extend type Query {
        getAllCompanies: [Company]
        getCompany(id: ID!): Company
        getCompanyByName(name: String!): Company
    }
    extend type Mutation {
        createCompany(name: String!, description: String, email: String, phone: String): Company!
    }
    type Company {
        id: ID!
        name: String!
        description: String
        email: String
        phone: String
        logo: String
        cover: String
        users: [User]
        products: [Product]
        createdAt: Date
        updatedAt: Date
    }
`;
