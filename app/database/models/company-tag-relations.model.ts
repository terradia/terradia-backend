import {
  AllowNull,
  Column,
  DataType,
  Default,
  ForeignKey,
  IsUUID,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import CompanyModel from "./company.model";
import CompanyTagModel from "./company-tag.model";

@Table({
  tableName: "CompaniesTagsRelations",
  timestamps: false
})
export default class CompanyTagRelationsModel extends Model<
  CompanyTagRelationsModel
> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @ForeignKey(() => CompanyModel)
  @AllowNull(false)
  @Column
  companyId!: string;

  @ForeignKey(() => CompanyTagModel)
  @AllowNull(false)
  @Column
  tagId!: string;
}
