import {
  AllowNull,
  BelongsToMany,
  Column,
  DataType,
  Default,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
  ForeignKey
} from "sequelize-typescript";
import CompanyModel from "./company.model";
import CompaniesUsers from "./companies-users.model";
import UserModel from "./user.model";

@Table({
  tableName: "RoleCompany",
  timestamps: false
})

export default class CompaniesRoleModel extends Model<CompaniesRoleModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @Column
  public name!: string;

  @AllowNull(true)
  @Column
  public parentCategoryId!: number;

  @ForeignKey(() => UserModel)
  @Column
  userId!: string;

  @ForeignKey(() => CompanyModel)
  @Column
  companyId!: string;

  @BelongsToMany(() => CompaniesUsers, {
    onDelete: "CASCADE",
    through: () => CompaniesUsers
  })
  company!: CompanyModel[];
}
