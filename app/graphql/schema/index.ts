import { ApolloServer, gql } from "apollo-server-express";

import userSchema from "./user";
import productSchema from "./product";
import categorySchema from "./category";
import companySchema from "./company";
import companyReviewSchema from "./companyReview";
import customerSchema from "./customer";
import productsReviewSchema from "./productReview";
import companyProductsCategorySchema from "./companyProductsCategory";
import companyUserSchema from "./companyUser";
import roleSchema from "./role";
import userPermissionsSchema from "./userPermissions";
import customerAddressSchema from "./customerAddress";
import cartSchema from "./cart";
import tagCompanyCategorySchema from "./companyTag";
import companyOpeningDaysSchema from "./companyOpeningDays";
import companyDeliveryDaysSchema from "./companyDeliveryDays";
import companyImagesSchema from "./companyImages";
import paymentSchema from "./payment";
import companyUserInvitationSchema from "./companyUserInvitation";
import orderSchema from "./order"

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
  productsReviewSchema,
  customerSchema,
  companyProductsCategorySchema,
  companyUserSchema,
  roleSchema,
  userPermissionsSchema,
  customerAddressSchema,
  cartSchema,
  tagCompanyCategorySchema,
  companyImagesSchema,
  companyOpeningDaysSchema,
  companyDeliveryDaysSchema,
  paymentSchema,
  companyUserInvitationSchema,
  orderSchema
];
