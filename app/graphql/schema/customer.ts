import { gql } from "apollo-server";

export default gql`
    extend type Query {
        getAllCustomers: [Customer]
        getCustomer(userId: String!): Customer
        getCustomerFavoriteCompanies(userId: String): [Company]
        getBasket: Basket
    }

    extend type Mutation {
        defineUserAsCustomer(userId: String!): Customer
        addFavoriteCompany(companyId: String!): Customer
        removeFavoriteCompany(companyId: String!): Customer
        addProductToBasket(productId: ID!, quantity: Int!): BasketProduct
        removeProductFromBasket(basketProductId: ID, productId: ID, quantity: Int!): Int
    }

    type Customer {
        id: String!
        user: User!
        companyReviews: [CompanyReview]
        favoriteCompanies: [Company]
      
        # Ordering related data
        basket: Basket
        # orders
        # receipts
    }
`;
