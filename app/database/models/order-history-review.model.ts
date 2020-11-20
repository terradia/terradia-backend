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
import CustomerModel from "./customer.model";
import CompanyModel from "./company.model";
import OrderHistoryModel from "./order-history.model";

@Table({
  tableName: "OrdersHistoryReviews",
  timestamps: true
})
export default class OrderHistoryReviewModel extends Model<
  OrderHistoryReviewModel
> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  public comment!: string;

  @Column(DataType.STRING)
  public customerMark!: number;

  @ForeignKey(() => OrderHistoryModel)
  @Column
  public orderHistoryId!: string;

  @BelongsTo(() => OrderHistoryModel)
  public orderHistory!: OrderHistoryModel;

  @Column
  public createdAt!: Date;
}
