import faker from "faker";
import UserModel from "../models/user.model";

const nb = 100;

interface user {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
}

let usersGenerated: [user] = [];
for (let i = 0 ; i < nb ; i++) {
    usersGenerated.push({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        phone: faker.phone.phoneNumber(),
    });
}

export const upUsers: any = async () => {
    return UserModel.bulkCreate(usersGenerated);
};
export const downUsers: any = () =>
    UserModel.destroy({ where: {} }).catch(err => {
        console.log(err);
    });