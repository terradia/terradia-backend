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
import CategoryModel from "./category.model";
import CompanyImageModel from "./company-image.model";

@Table({
  tableName: "ProductsCompanyImages",
  timestamps: true
})
export default class ProductCompanyImageModel extends Model<
  ProductCompanyImageModel
> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @ForeignKey(() => ProductModel)
  @Column
  productId!: string;

  @ForeignKey(() => CompanyImageModel)
  @Column
  companyImageId!: string;

  @BelongsTo(() => CompanyImageModel, "companyImageId")
  public companyImage!: string;

  @Column
  public createdAt!: Date;

  @Column
  public updatedAt!: Date;
}
