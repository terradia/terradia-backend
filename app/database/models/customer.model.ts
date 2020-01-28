import {
  BelongsTo, BelongsToMany,
  Column, DataType, Default,
  ForeignKey,
  HasMany, IsUUID,
  Model, PrimaryKey,
  Table
} from "sequelize-typescript";
import UserModel from "./user.model";
import CompanyReviewModel from "./company-review.model";
import CustomersFavoriteCompaniesModel from "./customers-favorite-companies.model";
import CompanyModel from "./company.model";
import ProductReviewModel from "./product-review.model";

// Customer :
// Contains the information of the customer, relating to his orders, payements, reviews etc...
@Table({
  tableName: "Customers",
  timestamps: false
})
export default class CustomerModel extends Model<CustomerModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @ForeignKey(() => UserModel)
  @Column
  public userId!: string;

  @BelongsTo(() => UserModel)
  public user!: UserModel;

  @HasMany(() => ProductReviewModel)
  public productReviews!: ProductReviewModel[];

  @HasMany(() => CompanyReviewModel)
  public companyReviews!: CompanyReviewModel[];

  @BelongsToMany(() => CompanyModel, () => CustomersFavoriteCompaniesModel)
  public favoriteCompanies!: CompanyModel[];
}
