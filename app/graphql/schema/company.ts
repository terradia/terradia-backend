import {gql} from "apollo-server";

export default gql`
    extend type Query {
        getAllCompanies(page: Int, pageSize: Int): [Company]
        getCompany(companyId: ID!): Company
        getCompanyByName(name: String!): Company
    }
    extend type Mutation {
        createCompany(name: String!, description: String, email: String, phone: String): Company!
        joinCompany(companyId: String!, userId: String!): Company!
        leaveCompany(companyId: String!, userId: String!): Company!
    }
    type Company {
        id: ID!
        name: String!
        description: String
        email: String
        phone: String
        logo: String
        cover: String
        products: [Product]
        productsCategories: [CompanyProductsCategory]
        reviews: [CompanyReview]
        averageMark: Float
        numberOfMarks: Int
        createdAt: Date
        updatedAt: Date
        users: [CompanyUser]
    }
`;
