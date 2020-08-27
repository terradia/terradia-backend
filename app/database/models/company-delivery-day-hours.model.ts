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
import CompanyDeliveryDayModel from "./company-delivery-day.model";

@Table({
  tableName: "CompaniesDeliveryDaysHours",
  timestamps: false
})
export default class CompanyDeliveryDayHoursModel extends Model<
  CompanyDeliveryDayHoursModel
> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @ForeignKey(() => CompanyDeliveryDayModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  public dayId!: string;

  @BelongsTo(() => CompanyDeliveryDayModel)
  public day!: CompanyDeliveryDayModel;

  @AllowNull(false)
  @Column(DataType.DATE)
  public startTime!: Date;

  @AllowNull(false)
  @Column(DataType.DATE)
  public endTime!: Date;
}
