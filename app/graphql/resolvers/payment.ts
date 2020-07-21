import UserModel from "../../database/models/user.model";
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated, isUserAndCustomer } from "./authorization";
import CustomerModel from "../../database/models/customer.model";

import Stripe, { AccountDebitSource } from "stripe";
import CustomerSource = module;
const stripe = new Stripe(
  "sk_test_51H6a9LHJwleKpfuCSnn9k6k4SY0IGjN9EBJ6NU2Y3l9VgxfQYCpsdLOEiVd6WobmM80yA3juKgmjwjEyqhnvXvpG00VrOmywaz",
  {
    apiVersion: "2020-03-02"
  }
);

declare interface Card {
  last4: string;
  exp_month: number;
  exp_year: number;
}

export default {
  Query: {
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
      ): Promise<any> => {
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
        stripe.customers.create(
          {
            email: user.email,
            phone: user.phone
          },
          function(err: any, customer: any) {
            console.log(err);
            CustomerModel.update(
              { stripeId: customer.id },
              {
                where: {
                  id: user.customer.id
                }
              }
            );

            // asynchronously called
          }
        );
        return true;
      }
    ),
    saveCard: combineResolvers(
      isUserAndCustomer,
      async (
        _: any,
        { cardId }: { cardId: string },
        { user }: { user: UserModel }
      ): Promise<Card> => {
        const card = await stripe.customers.createSource(
          user.customer.stripeId,
          {
            source: "tok_mastercard"
          }
        );
        return card;
      }
    ),
    deleteCard: combineResolvers(
      isUserAndCustomer,
      async (
        _: any,
        { cardId }: { cardId: string },
        { user }: { user: UserModel }
      ): Promise<boolean> => {
        stripe.customers.deleteSource(user.customer.stripeId, cardId, function(
          err,
          confirmation
        ) {
          // asynchronously called
        });
        return true;
      }
    )
  }
};
