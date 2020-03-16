import {
  AllowNull, BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  Default, ForeignKey, HasMany,
  IsUUID,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import ProductModel from "./product.model";
import CompanyModel from "./company.model";

@Table({
  tableName: "CompanyProductsCategories",
  timestamps: false
})
export default class CompanyProductsCategoryModel extends Model<CompanyProductsCategoryModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @Column(DataType.STRING)
  public name!: string;

  @ForeignKey(() => CompanyModel)
  @Column
  companyId!: string;

  @BelongsTo(() => CompanyModel)
  public company!: CompanyModel;

  @HasMany(() => ProductModel)
  public products!: ProductModel[];
}
