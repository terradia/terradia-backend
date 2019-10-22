import {
  AllowNull,
  HasMany,
  Column,
  DataType,
  Default,
  IsUUID,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import ProductModel from "./product.model";
import ProductCategoryModel from "./product-cateogry.model";
import UserModel from "./user.model";

@Table({
  tableName: "Companies",
  timestamps: false
})
export default class CompanyModel extends Model<CompanyModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id: string;

  @Column
  public name: string;

  @AllowNull(true)
  @Column
  public description: string;

  @Column
  public email: string;

  @Column
  public phone: string;

  @Column
  public logo: string;

  @Column
  public cover: string;

  @HasMany(() => UserModel)
  public users: UserModel[];

  @HasMany(() => ProductModel)
  public products: ProductModel[];

  @Column
  public createdAt: Date;

  @Column
  public updatedAt: Date;
}
