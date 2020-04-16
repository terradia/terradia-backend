import CompanyUserModel from "../../database/models/company-user.model";
import UserModel from "../../database/models/user.model";
import CompanyModel from "../../database/models/company.model";
import {ApolloError} from "apollo-server";
import RoleModel from "../../database/models/role.model";
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated } from "./authorization";

declare interface UserCompanyRoleProps {
  companyUserId: string,
  roleId: string
}

export default {
  Mutation: {
    addUserCompanyRole: combineResolvers(isAuthenticated,
      async (
        _: any,
      { companyUserId, roleId }: UserCompanyRoleProps
    ): Promise<CompanyUserModel | null> => {
      const companyUser: CompanyUserModel | null = await CompanyUserModel.findByPk(companyUserId, {
        include: [UserModel, CompanyModel, RoleModel]
      });
      if (!companyUser)
        throw new ApolloError("Can't find the user");
      const role: RoleModel | null = await RoleModel.findByPk(roleId);
      if (!role)
        throw new ApolloError("Can't find the role");
      await companyUser.$add("roles", role);
      return companyUser.reload();
    }),
    removeUserCompanyRole: combineResolvers(isAuthenticated,
      async (
        _: any,
      { companyUserId, roleId }: UserCompanyRoleProps
    ): Promise<CompanyUserModel | null> => {
      const companyUser: CompanyUserModel | null = await CompanyUserModel.findByPk(companyUserId, {
        include: [UserModel, CompanyModel, RoleModel]
      });
      if (!companyUser)
        throw new ApolloError("Can't find the user");
      const role: RoleModel | null = await RoleModel.findByPk(roleId);
      if (!role)
        throw new ApolloError("Can't find the role");
      await companyUser.$remove("roles", role);
      return companyUser.reload();
    })
  }
};
