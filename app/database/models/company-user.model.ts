import {
  BelongsTo, BelongsToMany,
  Column,
  DataType,
  Default, ForeignKey,
  IsUUID,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import CompanyModel from "./company.model";
import UserModel from "./user.model";
import RoleModel from "./role.model";
import CompanyUserRoleModel from "./company-user-role.model";

@Table({
  tableName: "CompanyUsers",
  timestamps: false
})
export default class CompanyUserModel extends Model<CompanyUserModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @ForeignKey(() => CompanyModel)
  @Column
  public companyId!: string;

  @BelongsTo(() => CompanyModel)
  public company!: CompanyModel;

  @ForeignKey(() => UserModel)
  @Column
  public userId!: string;

  @BelongsTo(() => UserModel)
  public user!: UserModel;

  @BelongsToMany(() => RoleModel, () => CompanyUserRoleModel)
  public roles!: RoleModel[];
}
