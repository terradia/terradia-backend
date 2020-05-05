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
    joinCompany(companyId: String!, userId: String!): Company!
    leaveCompany(companyId: String!, userId: String!): Company!

    # openingDays
    addOpeningDay(
      companyId: String!
      day: String!
      hours: [ScheduleInput]
    ): CompanyOpeningDay!
    updateOpeningDay(
      openingDayId: String!
      hours: [ScheduleInput]
    ): CompanyOpeningDay!
    removeOpeningDay(openingDayId: String!): CompanyOpeningDay!
    updateOpeningHours(
      hourId: String!
      hours: ScheduleInput!
    ): CompanyOpeningDayHours!
    removeOpeningHours(hourId: String!): CompanyOpeningDayHours!
  }
  type CompanyImages {
    id: ID!
    filename: String
    createdAt: Date
    updatedAt: Date
  }
  type Company {
    # Resource related information
    id: ID!
    name: String!
    description: String
    email: String
    phone: String
    logo: CompanyImages
    cover: CompanyImages
    createdAt: Date
    updatedAt: Date
    companyImages: [CompanyImages]
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

    # Opening Hours
    openingDays: [CompanyOpeningDay]
  }
  type GeographicPoint {
    coordinates: [Float]
  }
  type CompanyOpeningDay {
    id: ID!
    company: Company!
    dayTranslationKey: String!
    daySlugName: String!
    hours: [CompanyOpeningDayHours!]!
  }
  type CompanyOpeningDayHours {
    id: ID!
    day: CompanyOpeningDay!
    startTime: Date!
    endTime: Date!
  }
`;
