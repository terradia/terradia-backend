import express from "express";
import jwt from "jsonwebtoken";
import { AuthenticationError } from "apollo-server-express";

import User from "./database/models/user.model";
import CustomerModel from "./database/models/customer.model";
import CompanyUserModel from "./database/models/company-user.model";

export const getUser = async (req: express.Request) => {
  const { authorization } = req.headers;
  let token = authorization;
  if (authorization && authorization.substring(0, 7) == "Bearer ")
    token = authorization.substring(7, authorization.length);
  if (token) {
    try {
      const decoded: any = jwt.verify(token, process.env.TOKEN_SECRET!);
      return await User.findByPk(decoded.id, {
        include: [CustomerModel, CompanyUserModel]
      });
    } catch (e) {
      throw new Error(e);
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
