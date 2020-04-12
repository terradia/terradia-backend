import {
  AllowNull,
  Column, DataType, Default,
  ForeignKey, HasOne, IsUUID,
  Model, PrimaryKey,
  Table
} from "sequelize-typescript";
import ProductModel from "./product.model";
import BasketModel from "./basket";

@Table({
  tableName: "BasketProducts",
  timestamps: false
})
export default class BasketProductModel extends Model<BasketProductModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @Column(DataType.INTEGER)
  @AllowNull(false)
  quantity!: number;

  @ForeignKey(() => ProductModel)
  @Column(DataType.UUID)
  @AllowNull(false)
  productId!: string;

  @HasOne(() => ProductModel)
  product!: ProductModel;

  @ForeignKey(() => BasketModel)
  @Column(DataType.UUID)
  @AllowNull(false)
  basketId!: string;

  @HasOne(() => BasketModel)
  basket!: BasketModel;
}
