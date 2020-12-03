import { gql } from "apollo-server";

export default gql`
  extend type Query {
    getCart: Cart
    totalCartPrice: Float
    getCartsByCompany(companyId: String): [Cart]
  }

  extend type Mutation {
    addProductToCart(productId: ID!, quantity: Int!): CartProduct
    removeProductFromCart(productId: ID!, quantity: Int!): Int
    validateCart: Order
  }

  type Cart {
    id: ID!
    products: [CartProduct]
    company: Company!
    customer: Customer!
    expirationDate: Date
    totalPrice: Float
    numberProducts: Int!
    createdAt: Date
    updatedAt: Date
  }
  type CartProduct {
    id: ID!
    product: Product
    quantity: Int!
    cart: Cart!
  }
`;
