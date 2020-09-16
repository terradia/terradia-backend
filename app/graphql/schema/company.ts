import { gql } from "apollo-server";

export default gql`
  input ScheduleInput {
    startTime: Date!
    endTime: Date!
  }

  input CompanyUpdateInput {
    name: String
    description: String
    email: String
    phone: String
    address: String
    siren: String
    logoId: String
    coverId: String
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
      email: String!
      phone: String!
      address: String!
      siren: String!
    ): Company!
    deleteCompany(companyId: String!): Company!
    updateCompany(companyId: ID!, newValues: CompanyUpdateInput): Company!
    joinCompany(companyId: String!, userId: String!): Company!
    leaveCompany(companyId: String!, userId: String!): Company!
  }

  type Company {
    # Resource related information
    id: ID!
    name: String!
    officialName: String
    description: String
    email: String!
    phone: String!
    siren: String!
    logo: CompanyImage
    cover: CompanyImage
    createdAt: Date
    updatedAt: Date
    archivedAt: Date
    companyImages: [CompanyImage]
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
    deliveryDays: [CompanyDeliveryDay]
  }
  type GeographicPoint {
    coordinates: [Float]
  }
`;
