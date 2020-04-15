import {
  AllowNull, BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey, HasMany,
  HasOne,
  IsUUID,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import ProductModel from "./product.model";
import BasketModel from "./basket.model";

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

  @AllowNull(false)
  @Column(DataType.INTEGER)
  quantity!: number;

  @ForeignKey(() => ProductModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  productId!: string;

  @BelongsTo(() => ProductModel)
  product!: ProductModel;

  @ForeignKey(() => BasketModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  basketId!: string;

  @BelongsTo(() => BasketModel)
  basket!: BasketModel;
}
