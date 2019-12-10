import ProductModel from "../../database/models/product.model";
import UserModel from "../../database/models/user.model";
import CompanyModel from "../../database/models/company.model";

interface getAllCompaniesArguments {
  page: number;
  pageSize: number;
}

export default {
  Query: {
    getAllCompanies: async (_parent, { page, pageSize }: getAllCompaniesArguments, _context) => {
      return CompanyModel.findAll({
        include: [ProductModel, UserModel],
        offset: page,
        limit: pageSize,
      });
    },
    getCompany: async (_parent, { companyId }, _context) => {
      return CompanyModel.findByPk(companyId, {
        include: [ProductModel, UserModel]
      });
    },
    getCompanyByName: async (_parent, { name }: { name: string }) => {
      return CompanyModel.findOne({
        where: { name },
        include: [ProductModel, UserModel]
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
