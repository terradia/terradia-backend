import { gql } from "apollo-server";

export default gql`
  input ScheduleInput {
    startTime: Date!
    endTime: Date!
  }

  extend type Query {
    getAllCompanies(page: Int, pageSize: Int): [Company]
    getCompany(companyId: ID!): Company
    getCompanyByName(name: String!): Company
    getCompaniesByDistance(
      page: Int
      pageSize: Int
      lat: Float!
      lon: Float!
    ): [Company]
    getCompaniesByDistanceByCustomer(page: Int, pageSize: Int): [Company]
    getCompaniesByUser(userId: ID!): [CompanyUser]
    getCompanies: [Company]
    searchCompanies(query: String!): [Company]
  }
  extend type Mutation {
    createCompany(
      name: String!
      description: String
      logo: Upload
      cover: Upload
      email: String
      phone: String
      address: String!
    ): Company!
    deleteCompany(companyId: String!): Company!
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
    logo: CompanyImage
    cover: CompanyImage
    createdAt: Date
    updatedAt: Date
    archivedAt: Date
    companyImages: [CompanyImages]
    # Products related data
    products: [Product]
    productsCategories: [CompanyProductsCategory]

    # Geolocalization
    address: String!
    geoPosition: GeographicPoint
    distance: Float # field added when returning the data form the resolvers
    # Users
    users: [CompanyUser]

    # Customers
    customerCarts: [Cart]
    averageMark: Float
    numberOfMarks: Int
    reviews: [CompanyReview]

    tags: [CompanyTag]

    # Opening Hours
    openingDays: [CompanyOpeningDay]
  }
  type GeographicPoint {
    coordinates: [Float]
  }
`;
