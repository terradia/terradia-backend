import express from "express";
import jwt from "jsonwebtoken";
import { AuthenticationError } from "apollo-server-express";

import User from "./database/models/user.model";
import CompanyModel from "./database/models/company.model";
import CustomerModel from "./database/models/customer.model";
import CompanyUserModel from "./database/models/company-user.model";
import RoleModel from "./database/models/role.model";
import UserPermissionsModel from "./database/models/userPermissions.model";

export const getUser = async (req: express.Request) => {
  const { authorization } = req.headers;
  let token = authorization;
  if (authorization && authorization.substring(7, authorization.length) == "Bearer ")
    token = authorization.substring(7, authorization.length);
  if (token) {
    try {
      const decoded: any = await jwt.verify(
        token,
        process.env.TOKEN_SECRET!
      );
      let user =  await User.findByPk(decoded.id, {
        include: [
          {
            model: CompanyUserModel,
            include: [
                {model: RoleModel,
                  include: [UserPermissionsModel]
                },
              CompanyModel
            ]
          },
          CustomerModel]
      });
      return user;
    } catch (e) {
      throw new AuthenticationError(
        "Session expired, please connect you again" // TODO : change the string to be translated.
      );
    }
  }
  return;
};

export const generateAuthlink = (type: string, payload: object) => {
  const token = jwt.sign({ ...payload, type }, process.env.TOKEN_SECRET!, {});
  return `${process.env.HOSTNAME}/user/validation/${type}?token=${token}`;
};
