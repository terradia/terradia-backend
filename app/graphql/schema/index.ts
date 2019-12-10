import { gql } from "apollo-server-express";

import userSchema from "./user";
import productSchema from "./product";
import categorySchema from "./category";
import companySchema from "./company";
import productReviewSchema from "./productReview";
import customerSchema from "./customer";

const linkSchema = gql`
  scalar Date

  type Query {
    _: Boolean
  }
  type Mutation {
    _: Boolean
  }
  type Subscription {
    _: Boolean
  }
`;

export default [
  linkSchema,
  userSchema,
  categorySchema,
  productSchema,
  companySchema,
  productReviewSchema,
  customerSchema
];
