import { gql } from "apollo-server";

export default gql`
  extend type Mutation {
    # DeliveryDays
    addDeliveryDay(
      companyId: String!
      day: String!
      hours: [ScheduleInput]
    ): CompanyDeliveryDay!
    updateDeliveryDay(
      DeliveryDayId: String!
      hours: [ScheduleInput]
    ): CompanyDeliveryDay!
    removeDeliveryDay(DeliveryDayId: String!): CompanyDeliveryDay!
    updateDeliveryHours(
      hourId: String!
      hours: ScheduleInput!
    ): CompanyDeliveryDayHours!
    removeDeliveryHours(hourId: String!): CompanyDeliveryDayHours!
  }

  type CompanyDeliveryDay {
    id: ID!
    company: Company!
    dayTranslationKey: String!
    daySlugName: String!
    hours: [CompanyDeliveryDayHours!]!
  }
  type CompanyDeliveryDayHours {
    id: ID!
    day: CompanyDeliveryDay!
    startTime: Date!
    endTime: Date!
  }
`;
