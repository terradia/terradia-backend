import {
  AfterFind,
  AllowNull,
  BeforeBulkUpdate,
  BeforeCreate,
  BeforeUpdate,
  Column,
  DataType,
  Default,
  HasMany,
  HasOne,
  Is,
  IsEmail,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
  Unique
} from "sequelize-typescript";

import bcrypt from "bcryptjs";
import CustomerModel from "./customer.model";
import CompanyUserModel from "./company-user.model";

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

  @AllowNull(true)
  @Column(DataType.STRING)
  public password!: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING)
  public phone!: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  public validated!: boolean;

  @Unique
  @Column(DataType.STRING)
  public exponentPushToken!: string;

  @Unique
  @Column(DataType.STRING)
  public facebookId!: string;

  @Column
  public avatar!: string;

  @Column
  public passwordForgot!: string;

  // All companies for each user
  @HasMany(() => CompanyUserModel)
  public companies!: CompanyUserModel[];

  @HasOne(() => CustomerModel)
  public customer!: CustomerModel;

  @BeforeCreate
  @BeforeUpdate
  public static async hashPassword(user: UserModel): Promise<void> {
    if (user.changed("password")) {
      user.password = await bcrypt.hash(user.password, 15);
    }
  }
  @BeforeBulkUpdate
  public static async hashUpdatedPassword(user: any): Promise<void> {
    if (user.attributes.password) {
      user.attributes.password = await bcrypt.hash(
        user.attributes.password,
        15
      );
    }
  }

  public static comparePasswords(pass: string, hash: string): Promise<boolean> {
    return bcrypt.compare(pass, hash);
  }

  public static async userExist(email: string): Promise<boolean> {
    return !!UserModel.findOne({
      where: { email }
    });
  }

  public static async findByLogin(login: string): Promise<UserModel | null> {
    try {
      return UserModel.findOne({
        where: { email: login }
      });
    } catch (e) {
      throw e;
    }
  }
  // @AfterFind
  // static afterFindHook(result: any): void {
  //   let url = process.env.__S3_URL__;
  //   if (result.constructor === Array) {
  //     const arrayLength = result.length;
  //     for (let i = 0; i < arrayLength; i++) {
  //       result[i].avatar = process.env.__S3_URL__ + result[i].avatar;
  //     }
  //   } else {
  //     result.avatar = process.env.__S3_URL__ + result.avatar;
  //   }
  //   return result;
  // }
}
