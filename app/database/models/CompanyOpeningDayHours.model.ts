import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  IsUUID,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import CartProductModel from "./cart-product.model";
import CompanyModel from "./company.model";
import CustomerModel from "./customer.model";
import CompanyOpeningDayModel from "./CompanyOpeningDay.model";

@Table({
  tableName: "CompaniesOpeningDaysHours",
  timestamps: true
})
export default class CompanyOpeningDayHoursModel extends Model<
  CompanyOpeningDayHoursModel
> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @ForeignKey(() => CompanyOpeningDayModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  public dayId!: string;

  @BelongsTo(() => CompanyOpeningDayModel)
  public day!: CompanyOpeningDayModel;

  @AllowNull(false)
  @Column(DataType.DATE)
  public startTime!: Date;

  @AllowNull(false)
  @Column(DataType.DATE)
  public endTime!: Date;
}
