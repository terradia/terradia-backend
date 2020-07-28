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
import CompanyModel from "./company.model";
import CompanyDeliveryDayHoursModel from "./company-delivery-day-hours.model";

@Table({
  tableName: "CompaniesOpeningDays",
  timestamps: false
})
export default class CompanyDeliveryDayModel extends Model<
  CompanyDeliveryDayModel
> {
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

  @HasMany(() => CompanyDeliveryDayHoursModel, "dayId")
  public hours!: CompanyDeliveryDayHoursModel[];
}
