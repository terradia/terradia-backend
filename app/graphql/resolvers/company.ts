import ProductModel from "../../database/models/product.model";
import UserModel from "../../database/models/user.model";
import CompanyModel from "../../database/models/company.model";
import CompanyReviewModel from "../../database/models/company-review.model";
import CompanyProductsCategoryModel from "../../database/models/company-products-category.model";

export default {
  Query: {
    getAllCompanies: async (
      _parent: any,
      { page, pageSize }: { page: number; pageSize: number }
    ) => {
      return CompanyModel.findAll({
        include: [
          ProductModel,
          UserModel,
          CompanyReviewModel,
          CompanyProductsCategoryModel
        ],
        offset: page,
        limit: pageSize
      });
    },
    getCompany: async (_parent: any, { companyId }: { companyId: string }) => {
      return CompanyModel.findOne({
        where: { id: companyId },
        include: [
          ProductModel,
          UserModel,
          CompanyReviewModel,
          CompanyProductsCategoryModel
        ]
      });
    },
    getCompanyByName: async (_parent, { name }: { name: string }) => {
      return CompanyModel.findOne({
        where: { name },
        include: [
          ProductModel,
          UserModel,
          CompanyReviewModel,
          CompanyProductsCategoryModel
        ]
      });
    }
  },
  Mutation: {
    createCompany: async (
      _parent,
      _args: {
        name: string;
        description: string;
        email: string;
        phone: string;
      },
      { user }: { user: UserModel }
    ) => {
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
