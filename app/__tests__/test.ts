const {createTestClient} = require('apollo-server-testing');
import {createNewInstance} from './__utils'
const faker = require('faker');
const gql = require('graphql-tag');
import UserModel from "../database/models/user.model";

const generateUser = () => {
    return {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        password: faker.internet.password(),
        email: faker.internet.email(),
        // email: "test@test.com",
        phone: faker.phone.phoneNumber()
    };
};


const GET_PRODUCTS = gql`
    query getProducts {
        getAllCategories {
            id,
            name
        }
    }
`;


const REGISTER = gql`
    mutation Register($firstName: String!, $lastName: String!, $password: String!, $email: String!, $phone: String!) {
        register(firstName: $firstName, lastName: $lastName, password: $password, email: $email, phone: $phone){
            token,
            userId
        }
    }
`;

const LOGIN = gql`
    mutation login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            userId
        }
    }
`;
let mutate, query = null;
const expected = /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/;
let user = generateUser();
let server = null;

beforeAll(async (done) => {
    let emailAlreadyTaken = await UserModel.findOne({
        where: {email: user.email}
    });
    while (emailAlreadyTaken) {
        user = generateUser();
        emailAlreadyTaken = await UserModel.findOne({
            where: {email: user.email}
        });
    }
    server =  await createNewInstance();

    let serv = createTestClient(server);
    mutate = serv.mutate;
    query = serv.query;
    done();
});


describe("Testing register and login", () => {

    test('register', async (done) => {
        const registerRes = await mutate({
            mutation: REGISTER,
            variables: {
                firstName: user.firstName,
                lastName: user.lastName,
                password: user.password,
                email: user.email,
                phone: user.phone
            }
        });
        await expect(registerRes.data.register.userId).toEqual(expect.stringMatching(expected));
        done();
    });
    test('login', async (done) => {
        const res = await mutate({
            mutation: LOGIN,
            variables: {email: user.email, password: user.password},
        });
        await expect(res.data.login.userId).toEqual(expect.stringMatching(expected));
        done();
    });
    test('bad login', async (done) => {
        const res = await mutate({
            mutation: LOGIN,
            variables: {email: 'tttttttttttt@tttttt.com', password: 'thisisabadpassword'},
        });
        await expect(res.errors[0].message).toEqual(expect.stringMatching("No user found with this login credentials."));
        done();
    });

});

describe("Testing register and login", () => {
    test("Fetch categories", async (done) => {
        const res = await query({
            mutation: GET_PRODUCTS,
        });
        expect(Array.isArray(res.data.getAllCategories)).toBe(true);
        done();
    })
});