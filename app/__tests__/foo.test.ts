import { sum } from './foo';
const {createTestClient} = require('apollo-server-testing');
// const {constructTestServer} = require('./__utils');
import {createNewInstance} from './__utils'
const faker = require('faker');
const gql = require('graphql-tag');
import sequelize from "../database/models";
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

test('authentication', async () => {
    const expected = /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/;
    let user = generateUser();
    let emailAlreadyTaken = await UserModel.findOne({
        where: {email: user.email}
    });
    while (emailAlreadyTaken) {
        user = generateUser();
        emailAlreadyTaken = await UserModel.findOne({
            where: {email: user.email}
        });
    }
    const server =  await createNewInstance();
    const {mutate} =  createTestClient(server);
    const registerRes = await mutate({
        mutation: REGISTER,
        variables: {firstName: user.firstName, lastName: user.lastName, password: user.password, email: user.email, phone: user.phone}
    });
    const res = await mutate({
        mutation: LOGIN,
        variables: {email: user.email, password: user.password},
    });
    expect(res.data.login.userId).toEqual(expect.stringMatching(expected));
});

test('basic again', () => {
    expect(sum(1, 2)).toBe(3);
});