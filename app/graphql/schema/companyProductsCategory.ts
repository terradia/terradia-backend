import {gql} from "apollo-server";

export default gql`
    extend type Query {
        getAllCompanyProductsCategories(companyId: String!): [CompanyProductsCategory]
        getCompanyProductsCategory(companyId: String!, name: String, categoryId: String): CompanyProductsCategory
    }
    extend type Mutation {
        createCompanyProductsCategory(companyId: String!, name: String!): CompanyProductsCategory
        removeCompanyProductsCategory(categoryId: String!): CompanyProductsCategory
        addProductToCompanyCategory(categoryId: String!, productId: String!): Product
    }
    type CompanyProductsCategory {
        id: ID!
        name: String!
        company: Company!
        products: [Product]!
    }
`;
