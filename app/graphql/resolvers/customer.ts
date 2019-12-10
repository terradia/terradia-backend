import CustomerModel from "../../database/models/customer.model";
import UserModel from "../../database/models/user.model";
import CompanyReviewModel from "../../database/models/company-review.model";

export default {
  Query: {
    getAllCustomers: async () => {
      return CustomerModel.findAll({
        include: [UserModel, CompanyReviewModel]
      });
    },
    getCustomer: async (_parent, { userId }) => {
      return CustomerModel.findOne({
        where: { userId },
        include: [UserModel, CompanyReviewModel]
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
