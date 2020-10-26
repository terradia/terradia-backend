import {
  AllowNull, BelongsTo,
  Column,
  DataType,
  Default, ForeignKey,
  IsUUID,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import ProductModel from "./product.model";
import OrderModel from "./order.model";

@Table({
  tableName: "OrdersProducts",
  timestamps: false
})
export default class OrderProductModel extends Model<OrderProductModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @ForeignKey(() => ProductModel)
  @AllowNull(true)
  @Column(DataType.UUID)
  public productId!: string;

  @BelongsTo(() => ProductModel)
  public product!: ProductModel;

  @ForeignKey(() => OrderModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  public orderId!: string;

  @BelongsTo(() => OrderModel)
  public order!: string;

  @AllowNull(false)
  @Column(DataType.NUMBER)
  public quantity!: number;

  @AllowNull(false)
  @Column(DataType.NUMBER)
  public price!: number;
}
