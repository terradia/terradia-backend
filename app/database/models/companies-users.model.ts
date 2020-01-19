import { Column, ForeignKey, Model, Table, HasMany } from "sequelize-typescript";
import CompanyModel from "./company.model";
import UserModel from "./user.model";
import CompaniesRoleModel from "./role.model";

@Table({
  tableName: "RoleCompany",
  timestamps: false
})
export default class CompaniesUsersModel extends Model<CompaniesUsersModel> {
  // @ForeignKey(() => CompanyModel)
  // @Column
  // public companyId!: string;

  @HasMany(() => CompanyModel)
  public companyId!: CompanyModel[];

  @HasMany(() => UserModel)
  public userId!: UserModel[];

  // @ForeignKey(() => UserModel)
  // @Column
  // public userId!: string;

  @Column
  public role!: string;

}
