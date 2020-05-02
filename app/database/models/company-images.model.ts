import {
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
  tableName: "CompanyImages",
  timestamps: true
})
export default class CompanyImagesModel extends Model<CompanyImagesModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @Column
  public filename!: string;

  @ForeignKey(() => CompanyModel)
  @Column
  companyId!: string;

  @BelongsTo(() => CompanyModel)
  company!: CompanyModel;

  @ForeignKey(() => ProductModel)
  @Column
  productId!: string;

  @BelongsTo(() => ProductModel)
  product!: ProductModel;

  @Column
  public createdAt!: Date;

  @Column
  public updatedAt!: Date;
}
