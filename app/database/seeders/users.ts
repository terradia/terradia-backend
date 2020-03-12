import faker from "faker";
import UserModel from "../models/user.model";
import bcrypt from "bcrypt";

const nb = 20;

let admin = {
    firstName: "root",
    lastName: "root",
    email: "root@root.com",
    password: bcrypt.hashSync("rootroot", 15),
    phone: faker.phone.phoneNumber(),
};

interface user {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
}

async function generateUsers(): any[] {
    let usersGenerated: [user] = [];
    usersGenerated.push(admin);
    console.log("Generating users .... please wait");
    for (let i = 0 ; i < nb ; i++) {
        let password = bcrypt.hashSync(faker.internet.password(), 15);
        usersGenerated.push({
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            email: faker.internet.email(),
            password,
            phone: faker.phone.phoneNumber(),
        });
    }
    return usersGenerated;
}



export const upUsers: any = async () => {
    let usersGenerated = await generateUsers();
    return UserModel.bulkCreate(usersGenerated);
};
export const downUsers: any = () =>
  UserModel.destroy({ where: {} }).catch(err => {
      console.log(err);
  });