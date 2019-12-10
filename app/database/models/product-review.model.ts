import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript";
import ProductModel from "./product.model";
import CustomerModel from "./customer.model";

@Table({
  tableName: "ProductReviews",
  timestamps: false
})
export default class ProductReviewModel extends Model<ProductReviewModel> {
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
