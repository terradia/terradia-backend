import { gql } from "apollo-server-express";

import userSchema from "./user";
import productSchema from "./product";
import categorySchema from "./category";
import companySchema from "./company";
import companyReviewSchema from "./companyReview";
import customerSchema from "./customer";
import companyProductsCategorySchema from "./companyProductsCategory";
import companyUserSchema from "./companyUser";
import roleSchema from "./role";
import userPermissionsSchema from './userPermissions'
import customerAddressSchema from './customerAddress'

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
  companyReviewSchema,
  customerSchema,
  companyProductsCategorySchema,
  companyUserSchema,
  roleSchema,
  userPermissionsSchema
  customerAddressSchema
];
