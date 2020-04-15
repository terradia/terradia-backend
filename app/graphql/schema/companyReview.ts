import { gql } from "apollo-server";

export default gql`
    extend type Mutation {
        createCompanyReview(title: String, customerMark: Int!, description: String, companyId: String!): CompanyReview
    }
    
    type CompanyReview {
        id: String!
        title: String!
        description: String
        customerMark: Int!
        customer: Customer
        company: Company
    }
`;
