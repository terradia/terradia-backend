import {
  BelongsTo,
  Column,
  DataType,
  Default, ForeignKey,
  IsUUID,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import CompanyUserModel from "./company-user.model";
import RoleModel from "./role.model";

@Table({
  tableName: "CompanyUserRoles",
  timestamps: false
})
export default class CompanyUserRoleModel extends Model<CompanyUserRoleModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @ForeignKey(() => CompanyUserModel)
  @Column
  public companyUserId!: string;

  @BelongsTo(() => CompanyUserModel)
  public companyUser!: CompanyUserModel;

  @ForeignKey(() => RoleModel)
  @Column
  public roleId!: string;

  @BelongsTo(() => RoleModel)
  public role!: RoleModel
}
