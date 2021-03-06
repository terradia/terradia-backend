import UserModel from "../../database/models/user.model";
import CustomerModel from "../../database/models/customer.model";
import { ApolloError } from "apollo-server";
import ProductModel from "../../database/models/product.model";
import ProductReviewModel from "../../database/models/product-review.model";
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated, isUserAndCustomer } from "./authorization";

interface reviewData {
  title: string;
  customerMark: number;
  description?: string;
  productId: string;
}

interface ReplyData {
  reviewId: string;
  reply: string;
}

interface argumentsData {
  user: UserModel;
}

interface GetProductReviewsProps {
  id: string;
  limit: number;
  offset: number;
}

export default {
  Query: {
    getProductReviews: async (
      _: any,
      { id, limit, offset }: GetProductReviewsProps
    ): Promise<ProductReviewModel[]> => {
      return ProductReviewModel.findAll({
        where: { productId: id },
        include: [{ model: CustomerModel, include: [UserModel] }],
        offset,
        limit
      });
    }
  },
  Mutation: {
    createProductReview: combineResolvers(
      isUserAndCustomer,
      async (
        _: any,
        { title, customerMark, description, productId }: reviewData,
        { user: { customer } }: argumentsData
      ): Promise<ProductReviewModel | null> => {
        if (customer && customer.id !== undefined) {
          const product: ProductModel | null = await ProductModel.findByPk(
            productId
          );
          if (product) {
            const [review] = await ProductReviewModel.findOrCreate({
              where: {
                title: title !== undefined ? title : "",
                customerMark: customerMark,
                description: description !== undefined ? description : "",
                customerId: customer.id,
                productId: productId
              },
              defaults: {
                title: title !== undefined ? title : "",
                customerMark: customerMark,
                description: description !== undefined ? description : "",
                customerId: customer.id,
                productId: productId
              }
            });
            if (!review) {
              throw new ApolloError("can't create the review", "500");
            }

            const avg: number = product?.averageMark;
            const num: number = product?.numberOfMarks;
            const newNum: number = num + 1;
            const newAvg: number = (avg * num + customerMark) / newNum;

            await ProductModel.update(
              { averageMark: newAvg, numberOfMarks: newNum },
              { where: { id: productId } }
            );
            return ProductReviewModel.findByPk(review.id, {
              include: [
                {
                  model: CustomerModel,
                  include: [UserModel]
                },
                ProductModel
              ]
            });
          } else {
            throw new ApolloError("Can't find the product", "400");
          }
        } else {
          throw new ApolloError(
            "You need to be a customer review a product.",
            "403"
          );
        }
      }
    ),
    addReplyToProductReview: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        { reply, reviewId }: ReplyData,
        { user }: argumentsData
      ): Promise<ProductReviewModel | null> => {
        const [nb, rows] = await ProductReviewModel.update(
          { reply: reply },
          { where: { id: reviewId }, returning: true }
        );
        if (nb === 0 || rows === undefined) {
          throw new ApolloError("ReviewNotFound");
        }
        return rows[0];
      }
    ),
    deleteProductReply: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        { reviewId }: ReplyData,
        { user }: argumentsData
      ): Promise<ProductReviewModel | null> => {
        const [nb, rows] = await ProductReviewModel.update(
          { reply: null },
          { where: { id: reviewId }, returning: true }
        );
        if (nb === 0) {
          throw new ApolloError("ReviewNotFound");
        }
        return rows[0];
      }
    )
  }
};
