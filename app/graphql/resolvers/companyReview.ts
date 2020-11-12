import CompanyReviewModel from "../../database/models/company-review.model";
import UserModel from "../../database/models/user.model";
import CustomerModel from "../../database/models/customer.model";
import CompanyModel from "../../database/models/company.model";
import { ApolloError } from "apollo-server";
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated } from "./authorization";

interface reviewData {
  title: string;
  customerMark: number;
  description?: string;
  companyId: string;
}

interface argumentsData {
  user: UserModel;
}

declare interface CustomerModelMember {
  id: string;
}

interface GetCompanyReviewsProps {
  id: string;
  limit: number;
  offset: number;
}

export default {
  Query: {
    getCompanyReviews: async (
      _: any,
      { id, limit = 10, offset = 1 }: GetCompanyReviewsProps
    ): Promise<CompanyReviewModel[]> => {
      return CompanyReviewModel.findAll({
        where: { companyId: id },
        include: [{ model: CustomerModel, include: [UserModel] }],
        offset,
        limit
      });
    }
  },

  Mutation: {
    createCompanyReview: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        { title, customerMark, description, companyId }: reviewData,
        { user }: argumentsData
      ): Promise<CompanyReviewModel | null> => {
        if (!user.customer)
          throw new ApolloError("User is not a customer", "500");
        const customer: Partial<CustomerModelMember> = user.customer.toJSON();
        if (customer && customer.id !== undefined) {
          const company: CompanyModel | null = await CompanyModel.findByPk(
            companyId
          );
          if (company) {
            const [review]: [
              CompanyReviewModel,
              boolean
            ] = await CompanyReviewModel.findOrCreate({
              where: {
                title: title !== undefined ? title : "",
                customerMark: customerMark,
                description: description !== undefined ? description : "",
                customerId: customer.id,
                companyId: companyId
              },
              defaults: {
                title: title !== undefined ? title : "",
                customerMark: customerMark,
                description: description !== undefined ? description : "",
                customerId: customer.id,
                companyId: companyId
              }
            });
            if (!review) {
              throw new ApolloError("can't create the review", "500");
            }

            const avg: number = company.averageMark;
            const num: number = company.numberOfMarks;
            const newNum: number = num + 1;
            const newAvg: number = (avg * num + customerMark) / newNum;

            await CompanyModel.update(
              { averageMark: newAvg, numberOfMarks: newNum },
              { where: { id: companyId } }
            );
            return CompanyReviewModel.findByPk(review.id, {
              include: [
                {
                  model: CustomerModel,
                  include: [UserModel]
                },
                CompanyModel
              ]
            });
          } else {
            throw new ApolloError("This company does not exists", "404");
          }
        } else {
          throw new ApolloError(
            "You need to be a customer to review a product.",
            "403"
          );
        }
      }
    )
  }
};
