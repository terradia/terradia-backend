import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  Default,
  ForeignKey,
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
  tableName: "CompaniesUsersInvitations",
  timestamps: true
})
export default class CompanyUserInvitationModel extends Model<
  CompanyUserInvitationModel
> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @Column(DataType.STRING)
  public invitationEmail!: string;

  @ForeignKey(() => UserModel)
  @Column(DataType.UUID)
  public fromUserId!: string;

  @BelongsTo(() => UserModel)
  public fromUser!: UserModel;

  @ForeignKey(() => CompanyModel)
  @Column(DataType.UUID)
  public companyId!: string;

  @BelongsTo(() => CompanyModel)
  public company!: CompanyModel;

  @Column
  public status!: "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELED";

  @Column(DataType.DATE)
  public createdAt!: Date;

  @Column(DataType.DATE)
  public updatedAt!: Date;
}
