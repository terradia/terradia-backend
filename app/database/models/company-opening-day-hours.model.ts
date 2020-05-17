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
import CompanyOpeningDayModel from "./company-opening-day.model";

@Table({
  tableName: "CompaniesOpeningDaysHours",
  timestamps: false
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
