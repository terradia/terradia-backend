import { gql } from "apollo-server";

export default gql`
  extend type Query {
    listCustomerCards: [Card]
  }
  extend type Mutation {
    createStripeCustomer: Boolean!
    saveCard(cardId: String!): Card!
    deleteCard(cardId: String!): Boolean
  }
  type Card {
    last4: String!
    exp_month: Int!
    exp_year: Int!
    id: String!
    brand: String!
  }
`;
