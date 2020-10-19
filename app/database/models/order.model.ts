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
import CustomerModel from "./customer.model";
import CompanyModel from "./company.model";
import OrderProductModel from "./order-product.model";
import { Stripe } from "stripe";
import Data = module

@Table({
  tableName: "Orders",
  timestamps: true
})
export default class OrderModel extends Model<OrderModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  public code!: string;

  @ForeignKey(() => CustomerModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  public customerId!: string;

  @BelongsTo(() => CustomerModel)
  public customer!: CustomerModel;

  @ForeignKey(() => CompanyModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  public companyId!: string;

  @BelongsTo(() => CompanyModel)
  public company!: CompanyModel;

  @HasMany(() => OrderProductModel, "orderId")
  public products!: OrderProductModel[];

  @Column
  public createdAt!: Date;

  @Column
  public updatedAt!: Date;

  @Column(DataType.NUMBER)
  public price!: number;

  @Column(DataType.NUMBER)
  public numberProducts!: number

  @Column
  public status!: "PENDING" | "ACCEPTED" | "AVAILABLE" | "DECLINED"

  @AllowNull(true)
  @Column
  public decliningReason!: string
}
