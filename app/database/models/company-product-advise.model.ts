import {
  AllowNull,
  BelongsTo,
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
import ProductModel from "./product.model";

@Table({
  tableName: "CompanyProductAdvises",
  timestamps: true
})
export default class CompanyProductAdviseModel extends Model<CompanyProductAdviseModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @ForeignKey(() => CompanyModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  public companyId!: string;

  @BelongsTo(() => CompanyModel)
  public company!: CompanyModel;

  @ForeignKey(() => ProductModel)
  @AllowNull(true)
  @Column(DataType.UUID)
  public productId!: string;

  @BelongsTo(() => ProductModel)
  public product!: ProductModel;

  @Column
  public createdAt!: Date;

  @Column
  public updatedAt!: Date;

  @AllowNull(false)
  @Column(DataType.STRING)
  public title!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  public content!: string;
}
