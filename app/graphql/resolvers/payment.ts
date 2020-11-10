import UserModel from "../../database/models/user.model";
import { combineResolvers } from "graphql-resolvers";
import { isUserAndCustomer, isUserAndStripeCustomer } from "./authorization";
import CustomerModel from "../../database/models/customer.model";
import { ApolloError } from "apollo-server-errors";

import Stripe from "stripe";
import CartModel from "../../database/models/cart.model";
import CompanyModel from "../../database/models/company.model";
import CartProductModel from "../../database/models/cart-product.model";
import ProductModel from "../../database/models/product.model";

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
      isUserAndStripeCustomer,
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
            "SourceNotFound",
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
      isUserAndStripeCustomer,
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
      isUserAndStripeCustomer,
      async (
        _: any,
        __,
        { user }: { user: UserModel }
      ): Promise<Stripe.CustomerSource[]> => {
        const data = await stripe.customers.listSources(
          user.customer.stripeId,
          { object: "card", limit: 20 }
        );
        return data.data;
      }
    ),
    getPaymentIntents: combineResolvers(
      isUserAndStripeCustomer,
      async (
        _: any,
        { paymentId }: { paymentId: string },
        { user }: { user: UserModel }
      ): Promise<Stripe.PaymentIntent> => {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
        return paymentIntent;
      }
    ),
    getPaymentIntentsCard: combineResolvers(
      isUserAndStripeCustomer,
      async (
        _: any,
        { paymentId }: { paymentId: string },
        { user }: { user: UserModel }
      ): Promise<Stripe.Card> => {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
        const card = await stripe.customers.retrieveSource(
          paymentIntent.customer,
          paymentIntent.payment_method
        );
        return card;
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
      isUserAndStripeCustomer,
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
      isUserAndStripeCustomer,
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
      isUserAndStripeCustomer,
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
    ),
    createACharge: combineResolvers(
      isUserAndStripeCustomer,
      async (
        _: any,
        __: any,
        { user }: { user: UserModel }
      ): Promise<boolean> => {
        //Get current cart
        const customer: CustomerModel = user.customer;
        if (!customer) {
          throw new ApolloError("this user is not a customer", "400");
        }
        if (customer.cart === null) {
          throw new ApolloError("this customer does not have a cart", "400");
        }
        const cart = await CartModel.findOne({
          where: {
            customerId: user.customer.id
          },
          include: [
            CompanyModel,
            {
              model: CartProductModel,
              include: [ProductModel],
              order: ["updatedAt"]
            }
          ]
        });
        if (!cart) {
          throw new ApolloError("this customer does not have a cart", "400");
        }
        //Get current card
        const stripeCustomer = await stripe.customers.retrieve(
          user.customer.stripeId
        );
        if (!stripeCustomer.default_source) {
          throw new ApolloError(
            "This customer does not have any default source",
            "404"
          );
        }
        try {
          const charge = await stripe.charges.create({
            amount: cart.totalPrice * 100,
            currency: "eur",
            source: stripeCustomer.default_source,
            customer: stripeCustomer.id,
            description: "Commande pour un panier"
          });
        } catch (e) {
          throw new ApolloError(e.toString(), "404");
        }
        return true;
      }
    )
  }
};
