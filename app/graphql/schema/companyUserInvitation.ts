import { gql } from "apollo-server";

export default gql`
  extend type Query {
    getCompaniesInvitations(companyId: String): [CompanyUserInvitation]
    isUserInvited(email: String!): Boolean
  }

  extend type Mutation {
    inviteNewMember(
      companyId: String!
      invitationEmail: String!
    ): CompanyUserInvitation
    cancelInvitation(id: String!): Boolean

    acceptInvitation(invitationId: String!): CompanyUserInvitation
    declineInvitation(invitationId: String!): CompanyUserInvitation
  }

  enum CompanyUserInvitationStatus {
    PENDING
    ACCEPTED
    DECLINED
    CANCELED
  }

  enum CompanyUserInvitationStatusRequest {
    ALL
    PENDING
    ACCEPTED
    DECLINED
    CANCELED
  }

  type CompanyUserInvitation {
    id: String! # also is the invitation code
    invitationEmail: String!
    fromUser: User
    createdAt: Date
    company: Company
    status: CompanyUserInvitationStatus!
  }
`;
