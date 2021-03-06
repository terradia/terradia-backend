import UserModel from "../../database/models/user.model";
import { generateAuthlink } from "../../auth";
import jwt from "jsonwebtoken";
import { AuthenticationError, UserInputError } from "apollo-server";
import { ApolloError } from "apollo-server-errors";
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated } from "./authorization";
import { uploadToS3 } from "../../uploadS3";
import {
  createEmailRegister,
  newConnectionEmail
} from "../../services/mails/users";
import fetch from "node-fetch";
import userController from "../../controllers/user";
import CompanyUserInvitationModel from "../../database/models/company-user-invitation.model";
import { companyUserInvitationIncludes } from "./companyUserInvitation";
import {
  forgotPasswordEmail,
  passwordEditEmail,
  reactivateUserAccountEmail,
  archivedUserAccountEmail
} from "../../services/mails/users";

const createToken = async (
  user: UserModel,
  secret: string
): Promise<string> => {
  const payload: Partial<UserModel> = user.toJSON();
  delete payload.password;
  return jwt.sign(payload, secret);
};
declare interface Context {
  user: UserModel;
}

declare interface FacebookObject {
  email: string;
  first_name: string;
  id: string;
  last_name: string;
  name: string;
}

export default {
  Query: {
    getAllUsers: async (): Promise<UserModel[]> => {
      return UserModel.findAll();
    },

    getUser: async (_: any, __: any, { user }: { user: UserModel }) => {
      if (!user) {
        return null;
      }
      // TODO : Analytics
      return user;
    },
    doesFacebookAccountExistWithEmail: async (
      _: any,
      { facebookToken }: { facebookToken: string },
      { user }: { user: UserModel }
    ) => {
      let data: any = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email&access_token=${facebookToken}`
      );
      data = (await data.json()) as FacebookObject;
      if (data.error) throw new ApolloError("Facebook account not found");
      const userFound = await UserModel.findAll({
        where: { email: data.email }
      });
      return userFound.length > 0;
    },
    getMyCompaniesInvitations: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        {
          status
        }: {
          status?: "ALL" | "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELED";
        },
        { user }: { user: UserModel }
      ): Promise<CompanyUserInvitationModel[]> => {
        // 'where' is any because of the sequelize query we do later on.
        const where: any = { invitationEmail: user.email };
        if (status !== "ALL") where["status"] = status;
        return CompanyUserInvitationModel.findAll({
          where,
          include: companyUserInvitationIncludes
        });
      }
    )
  },
  Mutation: {
    login: async (
      _: any,
      {
        email,
        password,
        exponentPushToken
      }: { email: string; password: string; exponentPushToken: string },
      { secret }: { secret: string }
    ): Promise<{ userId: string; token: Promise<string> }> => {
      const user = await UserModel.findByLogin(email);
      if (!user) {
        throw new UserInputError("No user found with this login credentials.");
      }
      const isValid = await UserModel.comparePasswords(password, user.password);

      if (!isValid) {
        throw new AuthenticationError("Invalid password.");
      }
      if (user.archivedAt !== null) {
        const nb = await UserModel.update(
          { archivedAt: null },
          { where: { id: user.id } }
        );
        if (nb[0] == 0) {
          throw new ApolloError("This account is already deleted.");
        } else {
          reactivateUserAccountEmail(user.email, user.firstName); // Important mail - no check for mails notifications
        }
      }
      // if (user.mailsNotifications)
      //   newConnectionEmail(user.email, user.firstName, user.lastName);
      await UserModel.update(
        { exponentPushToken },
        {
          where: {
            email
          }
        }
      );
      return { token: createToken(user, secret), userId: user.id };
    },
    register: async (
      _: any,
      {
        email,
        defineUserAsCustomer,
        ...userInformations
      }: {
        email: string;
        firstName: string;
        lastName: string;
        password: string;
        phone: string;
        defineUserAsCustomer: boolean;
        exponentPushToken: string;
      },
      { secret }: { secret: string }
    ): Promise<{ userId: string; token: Promise<string>; message: string }> => {
      // TODO : make that it's possible to register with an invitation id which makes that it auto accept it.
      const emailAlreadyTaken = await UserModel.findOne({
        where: { email }
      });
      if (emailAlreadyTaken) {
        throw new ApolloError(
          "Il semblerait qu'il existe déjà un utilisateur avec cet email.",
          "403"
        );
      }
      const user = await UserModel.create({ ...userInformations, email });

      // TODO : send the generated url to the user via email.
      // this is the link generated by jwt to validate the user. Give it to the user by email to validate his account.
      const validationLink = generateAuthlink("check-email", {
        id: user.id
      });
      if (defineUserAsCustomer) {
        await userController.defineUserAsCustomer(user.id);
      }
      console.log(validationLink);
      // TODO : here handle the identification of the user for the analytics.
      createEmailRegister(email, validationLink, userInformations.firstName);
      return {
        token: createToken(user, secret),
        userId: user.id,
        message: `Un email de confirmation a été envoyé a cette adresse email : ${user.email}, clique sur le lien dans le mail afin valider ton compte !`
      };
    },
    updateUser: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        args: {
          email?: string;
          lastName?: string;
          firstName?: string;
          phone?: string;
          password?: string;
        },
        { user }: Context
      ): Promise<UserModel> => {
        const currentUser = await UserModel.findByPk(user.id);
        if (!currentUser) {
          throw new ApolloError("User not found", "404");
        }
        const toUpdate =
          args.email && args.email != currentUser.email
            ? { ...args, validated: false }
            : { ...args };
        const userResult: [number, UserModel[]] = await UserModel.update(
          toUpdate,
          {
            where: { id: user.id },
            returning: true
          }
        );
        if (userResult[0] === 0)
          throw new ApolloError("Could not update this user", "400");
        return userResult[1][0];
      }
    ),
    updateUserAvatar: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        avatar: {
          avatar: {
            stream: Body;
            filename: string;
            mimetype: string;
            encoding: string;
          };
        },
        { user }: Context
      ): Promise<UserModel | null> => {
        //TODO: Delete unused user avatar
        //TODO: Compress with aws lambda
        const { stream, filename } = await avatar.avatar;
        const { name } = await uploadToS3(filename, stream);
        const update = await UserModel.update(
          {
            avatar: name
          },
          { where: { id: user.id } }
        );
        return await UserModel.findByPk(user.id);
      }
    ),
    signUpWithFacebook: async (
      _: any,
      {
        facebookToken,
        exponentPushToken,
        defineUserAsCostumer
      }: {
        facebookToken: string;
        exponentPushToken: string;
        defineUserAsCostumer: boolean;
      },
      { secret }: { secret: string }
    ): Promise<{ userId: string; token: Promise<string>; message: string }> => {
      // TODO : make that it's possible to register with an invitation id which makes that it auto accept it.
      let data: any = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,first_name,last_name&access_token=${facebookToken}`
      );
      data = (await data.json()) as FacebookObject;
      if (data.error) throw new ApolloError("Facebook account not found");
      const [user] = await UserModel.findOrCreate({
        where: { email: data.email },
        defaults: {
          email: data.email,
          facebookId: data.id,
          exponentPushToken,
          phone: "070787866",
          firstName: data.first_name,
          lastName: data.last_name
        }
      });
      if (defineUserAsCostumer) {
        await userController.defineUserAsCustomer(user.id);
      }
      return {
        token: createToken(user, secret),
        userId: user.id,
        message: `Un email de confirmation a été envoyé a cette adresse email : ${user.email}, clique sur le lien dans le mail afin valider ton compte !`
      };
    },
    signInWithFacebook: async (
      _: any,
      {
        facebookToken,
        exponentPushToken
      }: { facebookToken: string; exponentPushToken: string },
      { secret }: { secret: string }
    ): Promise<{ userId: string; token: Promise<string> }> => {
      let data: any = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email&access_token=${facebookToken}`
      );
      data = (await data.json()) as FacebookObject;
      const user = await UserModel.findOne({
        where: { email: data.email }
      });
      if (!user) {
        throw new UserInputError("No user found with this login credentials.");
      }
      if (user.facebookId && data.id !== user.facebookId)
        throw new ApolloError("Account doesnt match");
      await UserModel.update(
        { facebookId: data.id, exponentPushToken },
        { where: { id: user.id } }
      );
      return { token: createToken(user, secret), userId: user.id };
    },
    generateCodePasswordForgot: async (
      _: any,
      { email }: { email: string }
    ) => {
      const user = await UserModel.findOne({ where: { email } });
      if (!user) {
        throw new ApolloError("Account doesnt exist");
      }
      const randomCode = Math.floor(100000 + Math.random() * 900000);
      console.log(randomCode);
      const res = await UserModel.update(
        { passwordForgot: randomCode },
        { where: { email } }
      );
      if (res[0]) {
        forgotPasswordEmail(email, user.firstName, randomCode.toString());
      }
      return res[0];
    },
    signInWithgeneratedCode: async (
      _: any,
      {
        email,
        code,
        exponentPushToken
      }: { email: string; code: string; exponentPushToken: string },
      { secret }: { secret: string }
    ) => {
      const user = await UserModel.findByLogin(email);

      if (!user) {
        throw new UserInputError("No user found with this login credentials.");
      }

      /**
       * User can login even if the email is not validated, mais will show a popup
       */
      // if (!user.validated) {
      //     throw new UserInputError(
      //         'Your account is not validated',
      //     );
      // }

      const isValid = user.passwordForgot === code;

      if (!isValid) {
        throw new AuthenticationError("Invalid code.");
      }
      await UserModel.update(
        { exponentPushToken, passwordForgot: null },
        { where: { id: user.id } }
      );

      return { token: createToken(user, secret), userId: user.id };
    },
    passwordValidation: async (
      _: any,
      { password }: { password: string },
      { user }: { user: UserModel }
    ) => {
      const isValid = await UserModel.comparePasswords(password, user.password);

      if (!isValid) {
        throw new AuthenticationError("Invalid password.");
      }
      if (user.mailsNotifications)
        passwordEditEmail(user.email, user.firstName);
      return true;
    },
    deleteUser: combineResolvers(
      isAuthenticated,
      async (_: any, { password }: { password: string }, { user }: Context) => {
        if (user.archivedAt === null) {
          const [nb, users] = await UserModel.update(
            { archivedAt: Date.now() },
            {
              where: { id: user.id },
              returning: true
            }
          );
          if (nb == 0) {
            throw new ApolloError("Can't archive this user account."); //TODO: translation
          } else {
            //TODO: implement alert & logout
            if (user.mailsNotifications)
              archivedUserAccountEmail(
                user.email,
                user.firstName,
                user.lastName
              );
          }
          return users[0];
        }
      }
    ),
    updateMailsNotifications: combineResolvers(
      isAuthenticated,
      async (_: any, __: any, { user }: Context) => {
        const [nb, users] = await UserModel.update(
          { mailsNotifications: !user.mailsNotifications },
          { where: { id: user.id }, returning: true }
        );
        if (nb === 0) {
          throw new ApolloError("Can't update notifications preferences.");
        }
        return users[0];
      }
    )
  }
};
