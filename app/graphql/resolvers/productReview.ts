import UserModel from "../../database/models/user.model";
import CustomerModel from "../../database/models/customer.model";
import { ApolloError } from "apollo-server";
import ProductModel from "../../database/models/product.model";
import ProductReviewModel from "../../database/models/product-review.model";

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
        const product = await ProductModel.findByPk(productId);
        return ProductReviewModel.create({
          title,
          customerMark,
          description
        }).then(async review => {
          await review.setCustomer(customer.id);
          await review.setProduct(productId);

          const avg = product.averageMark;
          const num = product.numberOfMarks;
          const newNum = num + 1;
          const newAvg = (avg * num + customerMark) / newNum;

          await ProductModel.update(
            { averageMark: newAvg, numberOfMarks: newNum },
            { where: { id: productId } }
          );
          return ProductReviewModel.findByPk(review.id, {
            include: [CustomerModel, ProductModel]
          });
        });
      } else {
        throw new ApolloError("You need to be a customer review a product.", "403");
      }
    }
  }
};
