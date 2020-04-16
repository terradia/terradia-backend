import {
  AllowNull, BelongsTo,
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
import CartModel from "./cart.model";

@Table({
  tableName: "CartProducts",
  timestamps: false
})
export default class CartProductModel extends Model<CartProductModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  quantity!: number;

  @ForeignKey(() => ProductModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  productId!: string;

  @BelongsTo(() => ProductModel)
  product!: ProductModel;

  @ForeignKey(() => CartModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  cartId!: string;

  @BelongsTo(() => CartModel)
  cart!: CartModel;
}
