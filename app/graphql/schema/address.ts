import { gql } from "apollo-server";

export default gql`
    extend type Mutation {
        createOrUpdateAddress(address: String!, apartment: String, information: String, id: String): Address
        setActiveAddress(id: String!): Address
    }
    
    extend type Query {
        getAllAddressesByUser: [Address]
        getActiveAddress: Address
    }
    
    type Address {
        id: String!
        address: String!
        apartment: String
        information: String
        active: Boolean!
        customer: Customer
    }
`;
