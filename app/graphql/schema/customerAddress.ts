import { gql } from "apollo-server";

export default gql`
    extend type Mutation {
        createOrUpdateCustomerAddress(address: String!, apartment: String, information: String, id: String): CustomerAddress
        setActiveCustomerAddress(id: String!): CustomerAddress
    }
    
    extend type Query {
        getAllCustomerAddressesByUser: [CustomerAddress]
        getActiveCustomerAddress: CustomerAddress
    }
    
    type CustomerAddress {
        id: String!
        address: String!
        apartment: String
        information: String
        active: Boolean!
        customer: Customer
    }
`;
