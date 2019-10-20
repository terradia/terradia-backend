import express from "express";
import jwt from "jsonwebtoken";
import { AuthenticationError } from "apollo-server-express";

import User from "./database/models/user.model";

export const getUser = async (req: express.Request) => {
    const { authorization } = req.headers;
    const token = authorization
        ? authorization.substring(7, authorization.length)
        : undefined;
    if (token) {
        try {
            const decoded: any = await jwt.verify(token, process.env.TOKEN_SECRET!);
            return await User.findByPk(decoded.id);
        } catch (e) {
            throw new AuthenticationError(
                "Session expired, please connect you again", // TODO : change the string to be translated.
            );
        }
    }
    return;
};

export const generateAuthlink = (type: string, payload: object) => {
    const token = jwt.sign({ ...payload, type }, process.env.TOKEN_SECRET!, {
        expiresIn: "1h"
    });
    return `${process.env.HOSTNAME}/user/validation/${type}?token=${token}`;
};