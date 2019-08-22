export default {
    Query: {
        getUser: async (_parent, _args, { user }) => {
            if (!user) {
                return null;
            }
            // TODO : Analytics
            return user;
        }
    }
};