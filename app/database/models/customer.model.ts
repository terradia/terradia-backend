import {
  BelongsTo,
  Column,
  ForeignKey,
  HasMany,
  Model,
  Table
} from "sequelize-typescript";
import UserModel from "./user.model";
import ProductReviewModel from "./product-review.model";

// Customer :
// Contains the information of the customer, relating to his orders, payements, reviews etc...
@Table({
  tableName: "Customers",
  timestamps: false
})
export default class CustomerModel extends Model<CustomerModel> {
  @ForeignKey(() => UserModel)
  @Column
  public userId: string;

  @BelongsTo(() => UserModel)
  public user : UserModel;

  @HasMany(() => ProductReviewModel)
  public productReviews : ProductReviewModel[];
}
