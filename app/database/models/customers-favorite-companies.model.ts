import {
  BelongsTo,
  Column, DataType, Default,
  ForeignKey,
  HasMany, IsUUID,
  Model, PrimaryKey,
  Table
} from "sequelize-typescript";
import UserModel from "./user.model";
import CompanyReviewModel from "./company-review.model";
import CustomerModel from "./customer.model";
import CompanyModel from "./company.model";

// Customer :
// Contains the information of the customer, relating to his orders, payements, reviews etc...
@Table({
  tableName: "CustomersFavoriteCompanies",
  timestamps: false
})
export default class CustomersFavoriteCompaniesModel extends Model<CustomersFavoriteCompaniesModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @ForeignKey(() => CustomerModel)
  @Column
  public customerId!: string;

  @ForeignKey(() => CompanyModel)
  @Column
  public companyId!: string;
}
