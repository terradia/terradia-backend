import jwt from "jsonwebtoken";
import { AuthenticationError } from "apollo-server-azure-functions";

import User from "./database/models/user.model";
import CompanyModel from "./database/models/company.model";

export const getUser = async (request: any) => {
    const { authorization }: any = request.headers;
    const token = authorization
        ? authorization.substring(7, authorization.length)
        : undefined;
    if (token) {
        try {
            const decoded: any = await jwt.verify(authorization, process.env.TOKEN_SECRET!);
            return await User.findByPk(decoded.id, {include: [CompanyModel]});
        } catch (e) {
            throw new AuthenticationError(
                "Session expired, please connect you again", // TODO : change the string to be translated.
            );
        }
    }
    return;
};

export const generateAuthlink = (type: string, payload: object) => {
    const token = jwt.sign({ ...payload, type }, process.env.TOKEN_SECRET!, {});
    return `${process.env.HOSTNAME}/${type}?token=${token}`;
};