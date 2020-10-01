import { gql } from "apollo-server";

export default gql`
  extend type Query {
    getCart: Cart
    totalCartPrice: Float
    getCartsByCompany(companyId: String): [Cart]
  }

  extend type Mutation {
    addProductToCart(productId: ID!, quantity: Int!): CartProduct
    removeProductFromCart(cartProductId: ID, productId: ID, quantity: Int!): Int
  }

  type CartProduct {
    id: ID!
    product: Product
    quantity: Int!
    cart: Cart!
  }
  type Cart {
    id: ID!
    products: [CartProduct]
    company: Company!
    customer: Customer!
    expirationDate: Date
    totalPrice: Float
    createdAt: Date
    updatedAt: Date
  }
`;
