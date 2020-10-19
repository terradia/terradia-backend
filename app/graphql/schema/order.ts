import { gql } from "apollo-server";

export default gql`
    extend type Query {
        # Customer Queries
        getMyOrders: [Order]
        getOrder(id: ID!): Order

        # Company Queries
        getCurrentOrders(companyId: ID!): [Order]
    }
#    extend type Mutation {
#        
#    }
    type Order {
        id: String!
        code: String!
        customer: Customer!
        company: Company!
        products: [OrderProduct]
        createdAt: Date!
        updatedAt: Date!
        price: Float!
        numberProducts: Int!
        status: String!
        decliningReason: String
    }
    type OrderProduct {
        id: String!
        product: Product!
        order: Order!
        quantity: Int!
        price: Float!
    }
`;
