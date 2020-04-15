import { gql } from "apollo-server";

export default gql`
    type BasketProduct {
        id: ID!
        product: Product
        quantity: Int!
        basket: Basket!
    }
    type Basket {
        id: ID!
        products: [BasketProduct]
        company: Company!
        customer: Customer!
        expirationDate: Date
        totalPrice: Float
        createdAt: Date
        updatedAt: Date
    }
`;
