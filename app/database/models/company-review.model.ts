import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript";
import ProductModel from "./product.model";
import CustomerModel from "./customer.model";
import CompanyModel from "./company.model";

@Table({
  tableName: "CompanyReviews",
  timestamps: false
})
export default class CompanyReviewModel extends Model<CompanyReviewModel> {
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

  @ForeignKey(() => CompanyModel)
  @Column
  public companyId!: string;

  @BelongsTo(() => CompanyModel)
  public company!: CompanyModel;
}
