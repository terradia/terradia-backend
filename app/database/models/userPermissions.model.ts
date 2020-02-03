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
import RoleModel from "./role.model";

@Table({
  tableName: "UserPermissions",
  timestamps: false
})
export default class UserPermissionsModel extends Model<UserPermissionsModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @Column
  public createCompany!: boolean;

  @ForeignKey(() => RoleModel)
  @Column
  public roleId!: string;

  @BelongsTo(() => RoleModel)
  public role!: RoleModel;
}
