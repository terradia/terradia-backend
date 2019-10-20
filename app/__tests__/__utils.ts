import resolvers from '../graphql/resolvers/index'
import typeDefs from '../graphql/schema/index'
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import {ApolloServer} from 'apollo-server-express'
import bodyParser = require("body-parser");

import sequelize from "../database/models";
import {getUser} from "../auth";
import userController from "../controllers/user";
import logger from "../logger";


const server: express.Express = express();

const customHost = process.env.HOST;
const prettyHost = customHost || "localhost";
const port: number = parseInt(process.env.PORT || "8000", 10);


const noCache = (
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    res.setHeader("Surrogate-Control", "no-store");
    res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
};


const whitelist = [
    "https://terradia.eu",
    "http://localhost:3000"
];
const corsOptions = {
    origin: whitelist,
    credentials: true
};


const createNewInstance = async () => {
    server.use(cors(corsOptions));
    server.use(helmet());
    server.use(noCache);
    server.use(compression());
    server.use(cookieParser());

    await sequelize;
    const graphServer = new ApolloServer({
        resolvers,
        typeDefs,
        context: async ({ req }) => {
            // const user = await getUser(req);
            // TOKEN_SECRET is the secret to generate the tokens of the users. It is in the env
            return {secret: process.env.TOKEN_SECRET };
        },
        formatError: error => {
            const message = error.message
                .replace("SequelizeValidationError: ", "")
                .replace("Validation error: ", "")
                .replace("GraphQL error:", "")
                .trim();
            return {
                ...error,
                message
            };
        },
        uploads: {
            maxFileSize: 5000000, // 5 MB
            maxFiles: 2
        }
    });
    graphServer.applyMiddleware({ app: server, cors: corsOptions });
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: true }));

    // check the email of the user.
    server.get("/user/validation/check-email", userController.checkEmail);

    server.use(
        (
            err: any,
            _req: express.Request,
            res: express.Response,
            _next: express.NextFunction
        ) => {
            console.error(err.stack);
            res.status(err.status || 500).send({ message: err.message, error: err });
        }
    );

    server.listen(port, prettyHost, (err: any) => {
        if (err) {
            return logger.error(err.message);
        }
        return logger.appStarted(port, prettyHost, graphServer.graphqlPath);
    });
    return graphServer;
};
module.exports.createNewInstance = createNewInstance;




