import { gql } from "apollo-server";

export default gql`
  extend type Query {
    listCustomerCards: [Card]
    getStripeCustomer: StripeCustomer
    getStripeCustomerDefaultSource: Card
    getPaymentIntents(paymentId: String!): PaymentIntent
    getPaymentIntentsCard(paymentId: String!): Card
  }
  extend type Mutation {
    createStripeCustomer: Boolean!
    saveCard(cardId: String!): Card!
    deleteCard(cardId: String!): Boolean
    updateCustomerDefaultSource(cardId: String!): Boolean
    createACharge: Boolean
  }
  type StripeCustomer {
    id: String!
    default_source: String!
  }
  type Card {
    last4: String!
    exp_month: Int!
    exp_year: Int!
    id: String!
    brand: String!
  }
  type PaymentIntent {
    id: String!
    payment_method: Card
  }
`;
