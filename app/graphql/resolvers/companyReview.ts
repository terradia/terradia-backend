import CompanyReviewModel from "../../database/models/company-review.model";
import UserModel from "../../database/models/user.model";
import CustomerModel from "../../database/models/customer.model";
import CompanyModel from "../../database/models/company.model";

interface reviewData {
  title: string;
  customerMark: number;
  description?: string;
  companyId: string;
}

interface argumentsData {
  user: UserModel;
}

export default {
  Mutation: {
    createCompanyReview: async (
      _parent,
      { title, customerMark, description, companyId }: reviewData,
      { user }: argumentsData
    ) => {
      const customer = user.customer.toJSON();
      if (customer) {
        return CompanyReviewModel.create(
          {
            title,
            customerMark,
            description
          }).then(async review => {
          await review.setCustomer(customer.id);
          await review.setCompany(companyId);
          return CompanyReviewModel.findByPk(review.id, {
            include: [CustomerModel, CompanyModel]
          });
        });
      } else {
        throw Error("You need to be a customer review a product.");
      }
    }
  }
};
