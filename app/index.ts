import {ApolloServer} from "apollo-server-azure-functions"
import resolvers from "./graphql/resolvers";
import typeDefs from "./graphql/schema";
import initSequelize from "./database/models";
import logger from "./logger";
import { getUser } from "./auth";

const customHost = process.env.DB_HOST;
const prettyHost = customHost || "localhost";
const port: number = parseInt(process.env.DB_PORT || "8000", 10);

const whitelist = [
    "https://terradia.eu",
    "http://localhost:3000"
];
const corsOptions = {
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"]
};

const startServer = () => {
    const timer = Date.now();
    console.log("initializing server (sequelize + Apollo): " + timer);
    initSequelize();

    const contextFunc = async (request: any) => {
        console.log("---------------------------");
        console.log(request);
        console.log("---------------------------");
        const user = await getUser(request.request).then((user) => {
            return user
        }).catch((err) => {
            console.log(err);
            return null;
        });
        // TOKEN_SECRET is the secret to generate the tokens of the users. It is in the env
        return { user, secret: process.env.TOKEN_SECRET };
    };

    const graphServer = new ApolloServer({
        resolvers: resolvers,
        typeDefs: typeDefs,
        context: contextFunc,
        formatError: error => {
            const message = error.message
                .replace("SequelizeValidationError: ", "")
                .replace("Validation error: ", "")
                .replace("GraphQL error:", "")
                .trim();
            console.log(message);
            return {
                ...error,
                message
            };
        },
        introspection: true,
        playground: true
    });
    logger.appStarted(port, prettyHost, graphServer.graphqlPath);

    const diff = Math.floor((Date.now() - timer));
    console.log("server initialized in : " + diff);
    return graphServer;
};

export default startServer().createHandler({cors: corsOptions})