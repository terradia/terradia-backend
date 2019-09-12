import { AuthenticationError, UserInputError } from 'apollo-server';
import jwt from 'jsonwebtoken';

const createToken = async (user, secret, expiresIn) => {
    const { id, email, username, role } = user;
    return await jwt.sign({ id, email, username, role }, secret, {
        expiresIn,
    });
};

const EXPIREIN = '3000m'

export default {
    Query: {
        getUser: async (_parent, _args, { user }) => {
            if (!user) {
                return null;
            }
            // TODO : Analytics
            return user;
        }
    },
    Mutation: {
        login: async(_parent, { email, password }, {models, secret}, _info ) => {
            let user = await models.models.UserModel.findByLogin(email);
            if (!user) {
                throw new UserInputError(
                    'No user found with this login credentials.',
                );
            }
            const isValid = await models.models.UserModel.comparePasswords(password, user.password);

            if (!isValid) {
                throw new AuthenticationError('Invalid password.');
            }
            return { token: createToken(user, secret, EXPIREIN) };
        }
    }
};