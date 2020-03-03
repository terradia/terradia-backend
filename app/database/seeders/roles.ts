import RoleModel from "../models/role.model";

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

export const upRoles: any = () => RoleModel.bulkCreate(roles);
export const downRoles: any = () => RoleModel.destroy({where: {}}).catch(err => {
    console.log(err);
});