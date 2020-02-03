import {
  AllowNull,
  BeforeCreate,
  BeforeUpdate,
  BelongsTo, BelongsToMany,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasOne,
  Is,
  IsEmail,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
  Unique
} from "sequelize-typescript";

import bcrypt from "bcrypt";
import CompanyModel from "./company.model";
import CustomerModel from "./customer.model";

const NAME_REGEX = /^[a-zàâéèëêïîôùüçœ\'’ -]+$/i;

@Table({
  tableName: "Users",
  timestamps: true
})
export default class UserModel extends Model<UserModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @Is(NAME_REGEX)
  @Column(DataType.STRING)
  public firstName!: string;

  @Is(NAME_REGEX)
  @Column(DataType.STRING)
  public lastName!: string;

  @AllowNull(false)
  @IsEmail
  @Column(DataType.STRING)
  public email!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  public password!: string;

  @Unique
  @Column(DataType.STRING)
  public phone!: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  public validated!: boolean;

  @ForeignKey(() => CompanyModel)
  @Column
  public companyId!: string;

  @BelongsTo(() => CompanyModel)
  public company!: CompanyModel;

  @HasOne(() => CustomerModel)
  public customer!: CustomerModel;

  @BeforeCreate
  @BeforeUpdate
  public static async hashPassword(user: UserModel) {
    if (user.changed("password")) {
      user.password = await bcrypt.hash(user.password, 15);
    }
  }

  public static comparePasswords(pass: string, hash: string): Promise<boolean> {
    return bcrypt.compare(pass, hash);
  }

  public static async userExist(email: string): Promise<boolean> {
    return !!UserModel.findOne({
        where: {email}
    });
  }

  public static async findByLogin(login: string): Promise<UserModel | null> {
    return UserModel.findOne({
      where: { email: login }
    });
  }
}
