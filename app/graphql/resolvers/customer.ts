import CustomerModel from "../../database/models/customer.model";
import UserModel from "../../database/models/user.model";
import ProductReviewModel from "../../database/models/product-review.model";

export default {
  Query: {
    getAllCustomers: async () => {
      return CustomerModel.findAll({
        include: [UserModel, ProductReviewModel]
      });
    },
    getCustomer: async (_parent, { userId }) => {
      return CustomerModel.findOne({
        where: { userId },
        include: [UserModel, ProductReviewModel]
      });
    }
  },
  Mutation: {
    defineUserAsCustomer: async (_parent, { userId }) => {
      const customer = await CustomerModel.findOne({
        where: { userId },
        include: [UserModel]
      });

      if (customer) {
        return customer;
      } else {
        return CustomerModel.create().then(
          customer => {
            customer.setUser(userId);
            return customer;
          }
        );
      }
    }
  }
};
