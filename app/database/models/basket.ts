import {
  AllowNull,
  Column, DataType, Default,
  ForeignKey, HasMany, HasOne, IsUUID,
  Model, PrimaryKey,
  Table
} from "sequelize-typescript";
import ProductModel from "./product.model";
import BasketProductModel from "./basket-product";
import CompanyModel from "./company.model";
import CustomerModel from "./customer.model";

@Table({
  tableName: "Baskets",
  timestamps: false
})
export default class BasketModel extends Model<BasketModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @HasMany(() => BasketProductModel)
  products!: BasketProductModel[];

  @Column(DataType.UUID)
  @AllowNull(false)
  companyId!: string;

  @HasOne(() => CompanyModel)
  company!: CompanyModel;

  @Column(DataType.UUID)
  @AllowNull(false)
  customerId!: string;

  @HasOne(() => CustomerModel)
  customer!: CustomerModel;

  @Column(DataType.DATE)
  @AllowNull(true)
  expirationDate!: Date | null
}
