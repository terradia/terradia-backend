import {
  BelongsTo, BelongsToMany,
  Column,
  DataType,
  Default, HasMany, HasOne,
  IsUUID,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import CompanyUserRoleModel from "./company-user-role.model";
import CompanyUserModel from "./company-user.model";
import UserPermissionsModel from "./userPermissions.model";

@Table({
  tableName: "Roles",
  timestamps: false
})
export default class RoleModel extends Model<RoleModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @Column
  public slugName!: string;

  @BelongsToMany(() => CompanyUserModel, () => CompanyUserRoleModel)
  public companyUser!: CompanyUserModel[];

  @Column
  public translationKey!: string;

  @HasOne(() => UserPermissionsModel)
  public userPermissions!: UserPermissionsModel;
}
