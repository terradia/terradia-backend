import UserModel from "../../database/models/user.model";
import { combineResolvers } from "graphql-resolvers";
import { isUserAndCustomer } from "./authorization";
import CustomerModel from "../../database/models/customer.model";
import { ApolloError } from "apollo-server-errors";

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: "2020-03-02"
});

declare interface Card {
  last4: string;
  exp_month: number;
  exp_year: number;
}

export default {
  Query: {
    getStripeCustomerDefaultSource: combineResolvers(
      isUserAndCustomer,
      async (
        _: any,
        __: any,
        { user }: { user: UserModel }
      ): Promise<Stripe.CustomerSource> => {
        const customer = await stripe.customers.retrieve(
          user.customer.stripeId
        );
        if (!customer.default_source) {
          throw new ApolloError(
            "This customer does not have any default source",
            "404"
          );
        }
        const card = await stripe.customers.retrieveSource(
          user.customer.stripeId,
          customer.default_source
        );
        return card;
      }
    ),
    getStripeCustomer: combineResolvers(
      isUserAndCustomer,
      async (
        _: any,
        __: any,
        { user }: { user: UserModel }
      ): Promise<Stripe.CustomerSource> => {
        const customer = await stripe.customers.retrieve(
          user.customer.stripeId
        );
        return customer;
      }
    ),
    listCustomerCards: combineResolvers(
      isUserAndCustomer,
      async (
        _: any,
        {
          number,
          expMonth,
          expYear,
          cvc
        }: { number: string; expMonth: number; expYear: number; cvc: number },
        { user }: { user: UserModel }
      ): Promise<Stripe.CustomerSource[]> => {
        const data = await stripe.customers.listSources(
          user.customer.stripeId,
          { object: "card", limit: 20 }
        );
        return data.data;
      }
    )
  },
  Mutation: {
    createStripeCustomer: combineResolvers(
      isUserAndCustomer,
      async (
        _: any,
        __: any,
        { user }: { user: UserModel }
      ): Promise<boolean> => {
        await stripe.customers
          .create({
            email: user.email,
            phone: user.phone
          })
          .then((customer: { id: any }) => {
            CustomerModel.update(
              { stripeId: customer.id },
              {
                where: {
                  id: user.customer.id
                }
              }
            );
          });
        return true;
      }
    ),
    saveCard: combineResolvers(
      isUserAndCustomer,
      async (
        _: any,
        { cardId }: { cardId: string },
        { user }: { user: UserModel }
      ): Promise<Stripe.CustomerSource> => {
        return await stripe.customers.createSource(user.customer.stripeId, {
          source: cardId
        });
      }
    ),
    deleteCard: combineResolvers(
      isUserAndCustomer,
      async (
        _: any,
        { cardId }: { cardId: string },
        { user }: { user: UserModel }
      ): Promise<boolean> => {
        await stripe.customers
          .deleteSource(user.customer.stripeId, cardId)
          .then(() => {
            //if it has been deleted
          });
        return true;
      }
    ),
    updateCustomerDefaultSource: combineResolvers(
      isUserAndCustomer,
      async (
        _: any,
        { cardId }: { cardId: string },
        { user }: { user: UserModel }
      ): Promise<boolean> => {
        const customer = await stripe.customers.update(user.customer.stripeId, {
          // eslint-disable-next-line @typescript-eslint/camelcase
          default_source: cardId
        });
        return true;
      }
    )
  }
};
