import RoleModel from "../models/role.model";
import Bluebird from "bluebird";

const roles = [
  {
    slugName: "owner",
    translationKey: "roles.owner"
  },
  {
    slugName: "member",
    translationKey: "roles.member"
  },
  {
    slugName: "admin",
    translationKey: "roles.admin"
  }
];

export const upRoles: () => Promise<RoleModel[]> = () =>
  RoleModel.bulkCreate(roles);

export const downRoles: () => Bluebird<number | void> = () => {
  console.log("=== Downing Roles ===");
  return RoleModel.destroy({ where: {} }).catch(err => {
    console.log(err);
  });
};
