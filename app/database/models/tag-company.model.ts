import {
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
import TagCompanyCategoryModel from "./tag-company-category.model";

@Table({
  tableName: "TagCompany",
  timestamps: false
})
export default class TagCompanyModel extends Model<TagCompanyModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @ForeignKey(() => CompanyModel)
  @Column
  companyId!: string;

  @ForeignKey(() => TagCompanyCategoryModel)
  @Column
  tagId!: string;
}
