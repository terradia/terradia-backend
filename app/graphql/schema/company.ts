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
            email: String
            phone: String
            address: String!
        ): Company!
        joinCompany(companyId: String!, userId: String!): Company!
        leaveCompany(companyId: String!, userId: String!): Company!
    }
    type Company {
        # Resource related information
        id: ID!
        name: String!
        description: String
        email: String
        phone: String
        logo: String
        cover: String
        createdAt: Date
        updatedAt: Date
        
        # Products related data
        products: [Product]
        productsCategories: [CompanyProductsCategory]
        
        # Geolocalization
        address: String!
        position: GeographicPoint
        distance: Float # field added when returning the data form the resolvers
        
        # Users
        users: [CompanyUser]
        
        # Customers
        customerCarts: [Cart]
        averageMark: Float
        numberOfMarks: Int
        reviews: [CompanyReview]
        
    }
    type GeographicPoint {
        coordinates: [Float]
    }
`;
