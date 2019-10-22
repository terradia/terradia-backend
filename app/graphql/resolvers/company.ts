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
      const newCompany = await CompanyModel.create({..._args}).then((compagny) =>  {
        compagny.addUser(user.id);
        return compagny;
      });
      // CompanyModel.update(
      //   { users: [user] },
      //   { where: { id: company.id } }
      // );
      return newCompany;
    }
  }
};
