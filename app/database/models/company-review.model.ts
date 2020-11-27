import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  IsUUID,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import CustomerModel from "./customer.model";
import CompanyModel from "./company.model";

@Table({
  tableName: "CompanyReviews",
  timestamps: false
})
export default class CompanyReviewModel extends Model<CompanyReviewModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @Column(DataType.STRING)
  public title!: string;

  @Column(DataType.STRING)
  public description!: string;

  @Column(DataType.STRING)
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

  @Column(DataType.STRING)
  public reply!: string;

  @Column
  public createdAt!: Date;

  @Column
  public updatedAt!: Date;
}
