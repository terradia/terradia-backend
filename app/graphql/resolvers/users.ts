import UserModel from "../../database/models/user.model";
import { generateAuthlink } from "../../auth";
import jwt from "jsonwebtoken";
import { AuthenticationError, UserInputError } from "apollo-server";
import { ApolloError } from "apollo-server-errors";

const createToken = async (user: UserModel, secret: string) => {
  const { id, email, username, role } = user;
  return jwt.sign({ id, email, username, role }, secret, {});
};

export default {
  Query: {
    getUser: async (_: any, __: any, { user }: { user: UserModel }) => {
      if (!user) {
        return null;
      }
      // TODO : Analytics
      return user;
    }
  },
  Mutation: {
    login: async (
      _: any,
      { email, password }: { email: string; password: string },
      { secret }: { secret: string }
    ) => {
      let user = await UserModel.findByLogin(email);
      if (!user) {
        throw new UserInputError("No user found with this login credentials.");
      }
      const isValid = await UserModel.comparePasswords(password, user.password);

      if (!isValid) {
        throw new AuthenticationError("Invalid password.");
      }
      return { token: createToken(user, secret), userId: user.id };
    },
    register: async (
      _: any,
      {
        email,
        ...userInformations
      }: {
        email: string;
        firstName: string;
        lastName: string;
        password: string;
        phone: string;
      },
      { secret }: { secret: string }
    ) => {
      const emailAlreadyTaken = await UserModel.findOne({
        where: { email }
      });
      if (emailAlreadyTaken) {
        throw new ApolloError(
          "Il semblerais qu'il existe déjà un utilisateur avec cet email.",
          403
        );
      }
      const user = await UserModel.create({ ...userInformations, email });

      // TODO : send the generated url to the user via email.
      // this is the link generated by jwt to validate the user. Give it to the user by email to validate his account.
      const validationLink = generateAuthlink("check-email", {
        id: user.id
      });
      console.log(validationLink);
      // TODO : here handle the identification of the user for the analytics.
      return {
        token: createToken(user, secret),
        userId: user.id,
        message: `Un email de confirmation a été envoyé a cette adresse email : ${user.email}, clique sur le lien dans le mail afin valider ton compte !`
      };
    }
  }
};
