import ProductModel from "../../database/models/product.model";
import UserModel from "../../database/models/user.model";
import CompanyModel from "../../database/models/company.model";
import CompanyReviewModel from "../../database/models/company-review.model";
import CompanyProductsCategoryModel from "../../database/models/company-products-category.model";
import uploadToS3 from '../../uploadS3';
import * as path from "path";
const md5 = require('md5');

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
      return CompanyModel.findAll({
        include: [
          ProductModel,
          UserModel,
          CompanyReviewModel,
          {
            model: CompanyProductsCategoryModel,
            include: [ProductModel]
          }
        ],
        offset: page,
        limit: pageSize
      });
    },
    getCompany: async (_parent, { companyId }: { companyId: string }) => {
      return CompanyModel.findByPk(companyId, {
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
    createCompany: async (_parent, _args, { user }: { user: UserModel }) => {
      const { stream, filename, mimetype, encoding } = await _args.logo;
      const hash = md5(filename) + path.extname(filename);
      uploadToS3(hash, stream);
      const newCompany = await CompanyModel.create({ ..._args, logo: hash }).then(
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
