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
import ProductModel from "./product.model";
import OrderModel from "./order.model";
import OrderHistoryModel from "./order-history.model";
import UnitModel from "./unit.model";

@Table({
  tableName: "OrdersProductsHistory",
  timestamps: false
})
export default class OrderProductHistoryModel extends Model<
  OrderProductHistoryModel
> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @ForeignKey(() => OrderHistoryModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  public orderHistoryId!: string;

  @BelongsTo(() => OrderHistoryModel)
  public orderHistory!: string;

  @ForeignKey(() => ProductModel)
  @AllowNull(true)
  @Column(DataType.UUID)
  public productId!: string;

  @BelongsTo(() => ProductModel)
  public product!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  public name!: string;

  @AllowNull(false)
  @Column(DataType.NUMBER)
  public quantity!: number;

  @AllowNull(false)
  @Column(DataType.NUMBER)
  public price!: number;

  @ForeignKey(() => UnitModel)
  @AllowNull(true)
  @Column(DataType.UUID)
  public unitId!: string;

  @BelongsTo(() => UnitModel)
  public unit!: string;

  @AllowNull(false)
  @Column(DataType.NUMBER)
  public quantityForUnit!: number;
}
