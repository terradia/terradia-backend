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
import ProductModel from "./product.model";
import ProductCompanyImageModel from "./product-company-images.model";

@Table({
  tableName: "CompanyImages",
  timestamps: true
})
export default class CompanyImageModel extends Model<CompanyImageModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @Column
  public filename!: string;

  @Column
  public name!: string;

  @ForeignKey(() => CompanyModel)
  @Column
  companyId!: string;

  @BelongsTo(() => CompanyModel)
  company!: CompanyModel;

  @BelongsToMany(
    () => ProductModel,
    () => ProductCompanyImageModel
  )
  products!: ProductModel[];

  @Column
  public createdAt!: Date;

  @Column
  public updatedAt!: Date;
}
