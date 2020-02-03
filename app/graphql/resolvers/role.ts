import CompanyUserModel from "../../database/models/company-user.model";
import UserModel from "../../database/models/user.model";
import CompanyModel from "../../database/models/company.model";

export default {
  Mutation: {
    addUserCompanyRole: async (_parent: any, { companyUserId, roleId }: { companyUserId: string, roleId: string }) => {
      console.log(companyUserId);
      return CompanyUserModel.findOne(
          {
            where: {id : companyUserId},
            include: [UserModel, CompanyModel]})
          .then(userCompany => {
        userCompany.addRole(roleId);
        return userCompany;
      });
    },
    removeUserCompanyRole: async (_parent: any, { companyUserId, roleId }: { companyUserId: string, roleId: string }) => {
      return CompanyUserModel.findOne(
          {
            where: {id : companyUserId},
            include: [UserModel, CompanyModel]})
          .then(userCompany => {
            userCompany.removeRole(roleId);
            return userCompany;
          });
    }
  }
};
