import { gql } from "apollo-server";

export default gql`
    extend type Mutation {
        createProductReview(title: String, customerMark: Int, description: String, productId: String): ProductReview
    }
    
    extend type Query {
        getProductReviews(id: ID!, limit: Int!, offset: Int!): [ProductReview]
    }
    
    type ProductReview {
        id: String!
        title: String!
        description: String
        customerMark: Int!
        customer: Customer
        product: Product
    }
`;
