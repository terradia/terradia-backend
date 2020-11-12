import faker from "faker";
import UserModel from "../models/user.model";
import bcrypt from "bcryptjs";
import CompanyModel from "../models/company.model";
import { ApolloError } from "apollo-server-errors";
import CompanyUserModel from "../models/company-user.model";
import RoleModel from "../models/role.model";
import CompanyUserRoleModel from "../models/company-user-role.model";

const nb = 5;

interface user {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

const admin: user = {
  firstName: "root",
  lastName: "root",
  email: "root@root.com",
  password: bcrypt.hashSync("rootroot", 15),
  phone: faker.phone.phoneNumber()
};

const generateUsers = async (): Promise<user[]> => {
  const usersGenerated: user[] = [];
  usersGenerated.push(admin);
  for (let i = 0; i < nb; i++) {
    const password = bcrypt.hashSync(faker.internet.password(), 15);
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
  const usersGenerated = await generateUsers();
  const users = await UserModel.bulkCreate(usersGenerated);

  const companies = await CompanyModel.findAll();
  const company = companies[0];
  const root = await UserModel.findOne({ where: { email: admin.email } });
  const userRole = await RoleModel.findOne({
    where: { slugName: "member" }
  });
  if (!root || !userRole) return users;
  await CompanyUserModel.create({
    companyId: company.id,
    userId: root.id
  }).then(userCompany => {
    CompanyUserRoleModel.create({
      companyUserId: userCompany.id,
      roleId: userRole.id
    });
  });
  return users;
};

export const downUsers: () => Promise<number> = () => {
  console.log("=== Downing Users ===");
  return CompanyUserRoleModel.destroy({ where: {} })
    .catch(err => {
      console.log(err);
    })
    .then(() => {
      return CompanyUserModel.destroy({ where: {} }).catch(err => {
        console.log(err);
      });
    })
    .then(() => {
      return UserModel.destroy({ where: {} }).catch(err => {
        console.log(err);
      });
    });
};
