import ProductModel from "../../database/models/product.model";
import UserModel from "../../database/models/user.model";
import CompanyModel from "../../database/models/company.model";

export default {
  Query: {
    getAllCompanies: async (_parent: any, _args: any, _context: any) => {
      return CompanyModel.findAll({
        include: [ProductModel, UserModel]
      });
    }
  },
  Mutation: {
    createCompany: async (_parent: any, _args: any, {user}: any) => {
      const newCompany = await CompanyModel.create({..._args}).then((company) =>  {
        company.$add("users", user.id);
        return company;
      });
      // CompanyModel.update(
      //   { users: [user] },
      //   { where: { id: company.id } }
      // );
      return newCompany.toJSON();
    }
  }
};
