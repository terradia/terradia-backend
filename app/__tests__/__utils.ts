import resolvers from '../graphql/resolvers/index'
import typeDefs from '../graphql/schema/index'

import {ApolloServer} from 'apollo-server-express'

import sequelize from "../database/models";

const createNewInstance = async () => {
    await sequelize;
    const graphServer = new ApolloServer({
        resolvers,
        typeDefs,
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
    return graphServer;
};
module.exports.createNewInstance = createNewInstance;




