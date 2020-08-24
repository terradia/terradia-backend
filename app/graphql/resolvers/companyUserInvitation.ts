import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated } from "./authorization";
import CompanyUserInvitationModel from "../../database/models/company-user-invitation.model";
import UserModel from "../../database/models/user.model";
import CompanyModel from "../../database/models/company.model";
import { ApolloError } from "apollo-server-errors";
import CompanyUserModel from "../../database/models/company-user.model";
import CompanyUserRoleModel from "../../database/models/company-user-role.model";
import RoleModel from "../../database/models/role.model";
import { createEmailInvitation } from "../../services/mails/users";

export const companyUserInvitationIncludes = [UserModel, CompanyModel];

export default {
  Query: {
    getCompaniesInvitations: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        { companyId }: { companyId: string }
      ): Promise<CompanyUserInvitationModel[] | null> => {
        const company: CompanyModel | null = await CompanyModel.findOne({
          where: { id: companyId },
          include: companyUserInvitationIncludes
        });
        if (company === null) throw new ApolloError("Company not found", "404");
        return CompanyUserInvitationModel.findAll({ where: { companyId } });
      }
    )
  },
  Mutation: {
    inviteNewMember: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        {
          companyId,
          invitationEmail
        }: { companyId: string; invitationEmail: string },
        { user }: { user: UserModel }
      ): Promise<CompanyUserInvitationModel | null> => {
        const companyUser: CompanyUserModel | null = await CompanyUserModel.findOne(
          { where: { userId: user.id, companyId } }
        );
        // check the user that invites is in the company
        if (companyUser === null)
          throw new ApolloError(
            "You don't have the right to invite a user in a company you are not inside",
            "403"
          );
        // check the email isn't the one from the user that invited
        if (user.email === invitationEmail)
          throw new ApolloError(
            "Why do you try to invite yourself ? Nice try :)",
            "403"
          );
        const company: CompanyModel | null = await CompanyModel.findOne({
          where: { id: companyId }
        });
        if (company === null) throw new ApolloError("Company not found", "404");
        const existingInvitation: CompanyUserInvitationModel | null = await CompanyUserInvitationModel.findOne(
          { where: { companyId, invitationEmail, status: "PENDING" } }
        );
        // check the company hasn't yet invited this email
        if (existingInvitation !== null)
          throw new ApolloError(
            "You can only invite one time the same member.",
            "400"
          );

        // check the email is the mail of a terradia user
        const userToInvite = await UserModel.findOne({
          where: { email: invitationEmail }
        });
        const isTerradiaUser = userToInvite !== null;
        if (userToInvite !== null) {
          const companyUser1: CompanyUserModel | null = await CompanyUserModel.findOne(
            { where: { userId: userToInvite.id, companyId } }
          );
          if (companyUser1 !== null)
            throw new ApolloError("User already in the company", "403");
        }

        // create the invitation on the DB
        const tmp: CompanyUserInvitationModel | null = await CompanyUserInvitationModel.create(
          { companyId, invitationEmail, fromUserId: user.id }
        );
        const invitation: CompanyUserInvitationModel | null = await CompanyUserInvitationModel.findOne(
          { where: { id: tmp.id }, include: companyUserInvitationIncludes }
        );
        if (invitation === null)
          throw new ApolloError("The invitation creation failed", "500");
        // createEmailInvitation(
        //   invitationEmail,
        //   invitation.id,
        //   isTerradiaUser
        //     ? `${userToInvite?.firstName} ${userToInvite?.lastName}`
        //     : undefined,
        //   `${user?.firstName} ${user?.lastName}`,
        //   company.name
        // );
        return invitation;
      }
    ),
    cancelInvitation: combineResolvers(
      isAuthenticated,
      async (_: any, { id }: { id: string }): Promise<boolean> => {
        const invitationDestroyResult: number = await CompanyUserInvitationModel.destroy(
          { where: { id } }
        );
        return invitationDestroyResult !== 0;
      }
    ),
    acceptInvitation: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        { invitationId }: { invitationId: string }
      ): Promise<CompanyUserInvitationModel | null> => {
        const invitation: CompanyUserInvitationModel | null = await CompanyUserInvitationModel.findOne(
          { where: { id: invitationId } }
        );
        // check the invitation does exist
        if (invitation === null)
          throw new ApolloError(
            "The invitation does not exist or was canceled",
            "404"
          );

        const invitedUser: UserModel | null = await UserModel.findOne({
          where: { email: invitation.invitationEmail }
        });
        if (invitedUser === null)
          throw new ApolloError("The user does not exist", "404");
        // change the status of the invitation

        const userRole: RoleModel | null = await RoleModel.findOne({
          where: { slugName: "member" }
        });
        if (userRole == null) {
          throw new ApolloError("Cannot find the role 'Member'", "500"); // TODO : translate
        }
        // add the user to the company linked to the invitation
        await CompanyUserModel.create({
          companyId: invitation.companyId,
          userId: invitedUser.id
        }).then(async userCompany => {
          await CompanyUserRoleModel.create({
            companyUserId: userCompany.id,
            roleId: userRole.id
          });
        });
        await CompanyUserInvitationModel.update(
          { status: "ACCEPTED" },
          { where: { id: invitationId } }
        );
        return CompanyUserInvitationModel.findByPk(invitationId);
      }
    ),
    declineInvitation: combineResolvers(
      isAuthenticated,
      async (_: any, { invitationId }: { invitationId: string }) => {
        const invitation: CompanyUserInvitationModel | null = await CompanyUserInvitationModel.findOne(
          { where: { id: invitationId } }
        );
        if (invitation === null)
          throw new ApolloError(
            "The invitation does not exist or was deleted",
            "404"
          );
        CompanyUserInvitationModel.update(
          { status: "DECLINED" },
          { where: { id: invitationId } }
        );
        return true;
      }
    )
  }
};
