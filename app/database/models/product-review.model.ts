import {
  BelongsTo,
  Column, DataType, Default,
  ForeignKey, IsUUID,
  Model, PrimaryKey,
  Table
} from "sequelize-typescript";
import ProductModel from "./product.model";
import CustomerModel from "./customer.model";

@Table({
  tableName: "ProductReviews",
  timestamps: false
})
export default class ProductReviewModel extends Model<ProductReviewModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @Column
  public title!: string;

  @Column
  public description!: string;

  @Column
  public customerMark!: number;

  @ForeignKey(() => CustomerModel)
  @Column
  public customerId!: string;

  @BelongsTo(() => CustomerModel)
  public customer!: CustomerModel;

  @ForeignKey(() => ProductModel)
  @Column
  public productId!: string;

  @BelongsTo(() => ProductModel)
  public product!: ProductModel;
}
