import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany, HasOne,
  IsUUID,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import CustomerModel from "./customer.model";
import CompanyModel from "./company.model";
import OrderProductModel from "./order-product.model";
import OrderProductHistoryModel from "./order-product-history.model";
import OrderHistoryReviewModel from "./order-history-review.model";

@Table({
  tableName: "OrdersHistory",
  timestamps: true
})
export default class OrderHistoryModel extends Model<OrderHistoryModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  public code!: string;

  @ForeignKey(() => CustomerModel)
  @AllowNull(true)
  @Column(DataType.UUID)
  public customerId!: string;

  @BelongsTo(() => CustomerModel)
  public customer!: CustomerModel;

  @ForeignKey(() => CompanyModel)
  @AllowNull(true)
  @Column(DataType.UUID)
  public companyId!: string;

  @BelongsTo(() => CompanyModel)
  public company!: CompanyModel;

  @AllowNull(false)
  @Column(DataType.STRING)
  public companyName!: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  public companyLogo!: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  public companyCover!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  public companyAddress!: string;

  @HasMany(() => OrderProductHistoryModel, "orderHistoryId")
  public products!: OrderProductHistoryModel[];

  @Column
  public createdAt!: Date;

  @Column
  public updatedAt!: Date;

  @Column
  public orderCreationDate!: Date;

  @Column(DataType.NUMBER)
  public price!: number;

  @Column(DataType.NUMBER)
  public numberProducts!: number;

  @AllowNull(true)
  @Column
  public decliningReason!: string;

  // @Column(DataType.STRING)
  // public stripePaymentIntent!: string;

  @Column
  public status!: "FINISHED" | "DECLINED" | "CANCELED";

  // @ForeignKey(() => OrderHistoryReviewModel)
  // @AllowNull(true)
  // @Column(DataType.UUID)
  // public orderHistoryReviewId!: string | null;

  @HasOne(() => OrderHistoryReviewModel, "orderHistoryId")
  public customerReview!: OrderHistoryReviewModel;
}
