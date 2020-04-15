import { gql } from "apollo-server";

export default gql`
    extend type Query {
        getAllCompanies(page: Int, pageSize: Int): [Company]
        getCompany(companyId: ID!): Company
        getCompanyByName(name: String!): Company
        getCompaniesByDistance(page: Int, pageSize: Int, lat: Float!, lon: Float!): [Company]
        getCompaniesByUser(userId: ID!): [CompanyUser]
        getCompanies: [Company]
    }
    extend type Mutation {
        createCompany(
            name: String!
            description: String
            logo: Upload!
            email: String
            phone: String
            address: String!
        ): Company!
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
        address: String!
        distance: Float
        position: GeographicPoint
        createdAt: Date
        updatedAt: Date
        users: [CompanyUser]
    }
    type GeographicPoint {
        coordinates: [Float]
    }
`;
