import { gql } from "apollo-server";

export default gql`
    extend type Mutation {
        createProductReview(title: String, customerMark: Int, description: String, productId: String): ProductReview
    }
    
    type ProductReview {
        id: String!
        title: String!
        description: String
        customerMark: Int!
        customer: Customer!
        product: Product!
    }
`;
