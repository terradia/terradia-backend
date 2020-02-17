import RoleModel from "../models/role.model";

const roles = [
    {
        slugName: "owner",
        translationKey: "roles.owner"
    }
];

export const upRoles: any = () => RoleModel.bulkCreate(roles);
export const downRoles: any = () =>
    RoleModel.destroy({where: {}}).catch(err => {
        console.log(err);
    });