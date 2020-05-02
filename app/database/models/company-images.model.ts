import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
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


  /**
   * Belongs to Company
   */
  @ForeignKey(() => CompanyModel)
  @Column
  companyId!: string;

  @BelongsTo(() => CompanyModel, "companyId")
  company!: CompanyModel;

  @ForeignKey(() => CompanyModel)
  @Column
  companyLogoId!: string;

  @BelongsTo(() => CompanyModel, "companyLogoId")
  companyLogo!: CompanyModel;


  /**
   * Belongs to product
   */
  @ForeignKey(() => ProductModel)
  @Column
  productCoverId!: string;

  @BelongsTo(() => ProductModel, "productCoverId")
  productCover!: ProductModel;

  @ForeignKey(() => ProductModel)
  @Column
  productImagesId!: string;

  @BelongsTo(() => ProductModel, "productImagesId")
  productImages!: ProductModel;

  @Column
  public createdAt!: Date;

  @Column
  public updatedAt!: Date;
}
