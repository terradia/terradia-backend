import { gql } from "apollo-server";

export default gql`
  extend type Mutation {
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
