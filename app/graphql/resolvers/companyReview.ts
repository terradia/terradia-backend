import CompanyReviewModel from "../../database/models/company-review.model";
import UserModel from "../../database/models/user.model";
import CustomerModel from "../../database/models/customer.model";
import CompanyModel from "../../database/models/company.model";
import { ApolloError } from "apollo-server";

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
      _parent: any,
      { title, customerMark, description, companyId }: reviewData,
      { user }: argumentsData
    ) => {
      const customer = user.customer.toJSON();
      if (customer) {
        const company = await CompanyModel.findByPk(companyId);
        if (company) {
          return CompanyReviewModel.create({
            title,
            customerMark,
            description
          }).then(async (review: CompanyReviewModel) => {
            await review.setCustomer(customer.id);
            await review.setCompany(companyId);

            const avg = company.averageMark;
            const num = company.numberOfMarks;
            const newNum = num + 1;
            const newAvg = (avg * num + customerMark) / newNum;

            await CompanyModel.update(
                { averageMark: newAvg, numberOfMarks: newNum },
                { where: { id: companyId } }
            );
            return CompanyReviewModel.findByPk(review.id, {
              include: [CustomerModel, CompanyModel]
            });
          });
        } else throw new ApolloError("This company does not exists", "404");
      } else {
        throw new ApolloError("You need to be a customer review a product.", "403");
      }
    }
  }
};
