const {createTestClient} = require('apollo-server-testing');
import {createNewInstance} from './__utils'
const faker = require('faker');
const gql = require('graphql-tag');
import UserModel from "../database/models/user.model";

const LOGIN = gql`
    mutation login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            userId
        }
    }
`;


let mutate = null;
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

    mutate = createTestClient(server).mutate;
    done();
});


describe("Testing register and login", () => {
    test("Fetch categories", async (done) => {

    })
});

