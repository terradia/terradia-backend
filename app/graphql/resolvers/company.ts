import ProductModel from "../../database/models/product.model";
import UserModel from "../../database/models/user.model";
import CompanyModel from "../../database/models/company.model";

export default {
  Query: {
    getAllCompanies: async (_parent, _args, _context) => {
      return CompanyModel.findAll({
        include: [ProductModel, UserModel]
      });
    }
  },
  Mutation: {
    createCompany: async (_parent, _args, { user }) => {
      const newCompany = await CompanyModel.create({..._args}).then((company) =>  {
        // @ts-ignore
        company.addUser(user.id);
        return company;
      });
      return newCompany.toJSON();
    }
  }
};
