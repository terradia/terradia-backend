import ProductModel from "../../database/models/product.model";
import UserModel from "../../database/models/user.model";
import CompanyModel from "../../database/models/company.model";
import CompanyReviewModel from "../../database/models/company-review.model";

interface getAllCompaniesArguments {
  page: number;
  pageSize: number;
}

export default {
  Query: {
    getAllCompanies: async (_parent, { page, pageSize }: getAllCompaniesArguments) => {
      return CompanyModel.findAll({
        include: [ProductModel, UserModel, CompanyReviewModel],
        offset: page,
        limit: pageSize,
      });
    },
    getCompany: async (_parent, { companyId }, _context) => {
      return CompanyModel.findByPk(companyId, {
        include: [ProductModel, UserModel, CompanyReviewModel]
      });
    },
    getCompanyByName: async (_parent, { name }: { name: string }) => {
      return CompanyModel.findOne({
        where: { name },
        include: [ProductModel, UserModel, CompanyReviewModel]
      });
    }
  },
  Mutation: {
    createCompany: async (_parent, _args, { user }) => {
      const newCompany = await CompanyModel.create({ ..._args }).then(
        company => {
          // @ts-ignore
          company.addUser(user.id);
          return company;
        }
      );
      return newCompany.toJSON();
    }
  }
};
