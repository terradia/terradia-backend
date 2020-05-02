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
import CompanyOpeningDayHoursModel from "./CompanyOpeningDayHours.model";

@Table({
  tableName: "CompaniesOpeningDays",
  timestamps: true
})
export default class CompanyOpeningDayModel extends Model<CompanyOpeningDayModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @ForeignKey(() => CompanyModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  public companyId!: string;

  @BelongsTo(() => CompanyModel)
  public company!: CompanyModel;

  @AllowNull(false)
  @Column(DataType.STRING)
  public dayTranslationKey!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  public daySlugName!: string;

  @HasMany(() => CompanyOpeningDayHoursModel, "dayId")
  public hours!: CompanyOpeningDayHoursModel[]
}
