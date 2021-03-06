import { ForbiddenError } from "apollo-server";
import { combineResolvers, skip } from "graphql-resolvers";
import UserModel from "../../database/models/user.model";

export const isAuthenticated = (
  parent: any,
  args: any,
  { user }: { user: UserModel }
) => (user ? skip : new ForbiddenError("Not authenticated as user."));

export const isUserAndCustomer = combineResolvers(
  isAuthenticated,
  (parent, args, { user: { customer } }) =>
    customer ? skip : new ForbiddenError("You are not a customer")
);

export const isUserAndStripeCustomer = combineResolvers(
  isUserAndCustomer,
  (parents, args, { user: { customer } }) =>
    customer.stripeId
      ? skip
      : new ForbiddenError("You are not a stripe customer")
);

export const isUserInCompany = combineResolvers(
  isAuthenticated,
  (parents, { companyId }: { companyId: string }, { user: { companies } }) => {
    if (companies.findIndex(elem => elem.companyId === companyId) !== -1)
      return skip;
    new ForbiddenError("Your are not in this company");
  }
);
