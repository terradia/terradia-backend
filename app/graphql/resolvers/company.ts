import ProductModel from "../../database/models/product.model";
import UserModel from "../../database/models/user.model";
import CompanyModel from "../../database/models/company.model";
import CompanyReviewModel from "../../database/models/company-review.model";
import CompanyProductsCategoryModel from "../../database/models/company-products-category.model";
import CompanyUserModel from "../../database/models/company-user.model";
import RoleModel from "../../database/models/role.model";
import companyUser from "../schema/companyUser";
import { UserInputError } from 'apollo-server-express'

interface getAllCompaniesArguments {
  page: number;
  pageSize: number;
}

export default {
  Query: {
    getAllCompanies: async (
        _parent: any,
        {
          page,
          pageSize
        }: {
          page: number;
          pageSize: number;
        }
    ) => {
      let companies = await CompanyModel.findAll({
        include: [
          ProductModel,
          {
            model: CompanyUserModel,
            include: [RoleModel, UserModel]
          },
          CompanyReviewModel,
          {
            model: CompanyProductsCategoryModel,
            include: [ProductModel]
          }
        ],
        offset: page,
        limit: pageSize
      });
      return companies;
    },
    getCompany: async (_parent, { companyId }: { companyId: string }) => {
      let company = await  CompanyModel.findByPk(companyId, {
        include: [
          ProductModel,
          {
            model: CompanyUserModel,
            include: [RoleModel, UserModel]
          },
          CompanyReviewModel,
          {
            model: CompanyProductsCategoryModel,
            include: [ProductModel]
          }
        ]
      });
      return company;
    },
    getCompanyByName: async (_parent, { name }: { name: string }) => {
      return CompanyModel.findOne({
        where: { name },
        include: [
          ProductModel,
          {
            model: CompanyUserModel,
            include: [RoleModel, UserModel]
          },
          CompanyReviewModel,
          {
            model: CompanyProductsCategoryModel,
            include: [ProductModel]
          }
        ]
      });
    }
  },
  Mutation: {
    createCompany: async (_parent, _args, { user }: { user: UserModel }) => {
      const newCompany = await CompanyModel.create({ ..._args }).then(
          company => {
            console.log(company);
            // @ts-ignore
            company.addUser(user.id);
            return company;
          }
      );
      const ownerRole = await RoleModel.findOne({where: {slugName: "owner"}});
      await CompanyUserModel.create({
        companyId: newCompany.id,
        userId: user.id,
        role: ownerRole.id
      }).then(userCompany => {
        userCompany.addRole(ownerRole.id);
      });
      return newCompany.toJSON();
    },
    joinCompany: async (_parent, {companyId, userId}, { user }: { user: UserModel}) => {
      const userRole = await RoleModel.findOne({where: {slugName: "user"}});
      await CompanyUserModel.create({
        companyId,
        userId,
        role: userRole.id
      }).then(userCompany => {
        userCompany.addRole(userRole.id);
      });
      return CompanyModel.findByPk(companyId);
    },
    leaveCompany: async (_parent, {companyId, userId}, {user}: {user: UserModel}) => {
       let companyUser = await CompanyUserModel.destroy({
        where: {
          userId
        }
      }).then((data) => {
        if (data === 0)
          throw new UserInputError("User not found in company");
       }).error((error) => {
         throw new UserInputError(error);
       });
      return CompanyModel.findByPk(companyId);
    }
  }
};
