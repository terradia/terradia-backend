import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  HasOne,
  IsUUID,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import BasketProductModel from "./basket-product.model";
import CompanyModel from "./company.model";
import CustomerModel from "./customer.model";

@Table({
  tableName: "Baskets",
  timestamps: true
})
export default class BasketModel extends Model<BasketModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @HasMany(() => BasketProductModel, "basketId")
  products!: BasketProductModel[];

  @ForeignKey(() => CompanyModel)
  @AllowNull(false)
  @Column
  companyId!: string;

  @BelongsTo(() => CompanyModel)
  company!: CompanyModel;

  @ForeignKey(() => CustomerModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  customerId!: string;

  @BelongsTo(() => CustomerModel, "customerId")
  customer!: CustomerModel;

  @AllowNull(true)
  @Column(DataType.DATE)
  expirationDate!: Date | null;

  @Column(DataType.FLOAT)
  totalPrice!: number;

  @Column
  public createdAt!: Date;

  @Column
  public updatedAt!: Date;
}
