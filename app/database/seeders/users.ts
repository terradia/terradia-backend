import faker from "faker";
import UserModel from "../models/user.model";
import bcrypt from "bcryptjs";

const nb = 5;

interface user {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

let admin: user = {
  firstName: "root",
  lastName: "root",
  email: "root@root.com",
  password: bcrypt.hashSync("rootroot", 15),
  phone: faker.phone.phoneNumber()
};

const generateUsers = (): user[] => {
  let usersGenerated: user[] = [];
  usersGenerated.push(admin);
  console.log("Generating users .... please wait");
  for (let i = 0; i < nb; i++) {
    let password = bcrypt.hashSync(faker.internet.password(), 15);
    usersGenerated.push({
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      password,
      phone: faker.phone.phoneNumber()
    });
  }
  return usersGenerated;
};

export const upUsers: () => Promise<UserModel[]> = async () => {
  let usersGenerated = generateUsers();
  return UserModel.bulkCreate(usersGenerated);
};

export const downUsers: () => Promise<number> = () =>
  UserModel.destroy({ where: {} }).catch(err => {
    console.log(err);
  });
