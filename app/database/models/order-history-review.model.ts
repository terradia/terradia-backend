import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey, HasOne,
  IsUUID,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
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
  @AllowNull(false)
  @Column(DataType.UUID)
  public orderHistoryId!: string;

  @BelongsTo(() => OrderHistoryModel, "orderHistoryId")
  public orderHistory!: OrderHistoryModel;

  @Column
  public createdAt!: Date;

  @Column
  public updatedAt!: Date;
}
