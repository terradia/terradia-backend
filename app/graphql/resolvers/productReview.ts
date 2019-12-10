import ProductReviewModel from "../../database/models/product-review.model";
import UserModel from "../../database/models/user.model";
import CustomerModel from "../../database/models/customer.model";
import ProductModel from "../../database/models/product.model";

interface reviewData {
  title: string;
  customerMark: number;
  description?: string;
  productId: string;
}

interface argumentsData {
  user: UserModel;
}

export default {
  Mutation: {
    createProductReview: async (
      _parent,
      { title, customerMark, description, productId }: reviewData,
      { user }: argumentsData
    ) => {
      const customer = user.customer.toJSON();
      if (customer) {
        const review = await ProductReviewModel.findOne({
          where: { customerId: customer.id, productId },
          include: [CustomerModel, ProductModel]
        });
        if (review) {
          throw Error("you have already created a review for this product.");
        } else {
          return ProductReviewModel.create(
            {
              title,
              customerMark,
              description
            }
          ).then(async review => {
            await review.setCustomer(customer.id);
            await review.setProduct(productId);
            return review;
          });
        }
      } else {
        throw Error("You need to be a customer review a product.");
      }
    }
  }
};
