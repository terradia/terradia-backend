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
    }
];

export const upRoles: () => Promise<RoleModel[]> = () => (RoleModel.bulkCreate(roles));

export const downRoles: () => Bluebird<number | void> = () => (
    RoleModel.destroy({where: {}}).catch(err => {
        console.log(err);
    })
);