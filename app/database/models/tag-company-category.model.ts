import {
  AllowNull,
  BelongsToMany,
  Column,
  DataType,
  Default,
  IsUUID,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import CompanyModel from "./company.model";
import TagCompanyModel from "./tag-company.model";

@Table({
  tableName: "TagCompanyCategory",
  timestamps: false
})
export default class TagCompanyCategoryModel extends Model<TagCompanyCategoryModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @Column
  public name!: string;

  @AllowNull(true)
  @Column
  public parentCategoryId!: number;

  @BelongsToMany(() => CompanyModel, {
    onDelete: "CASCADE",
    through: () => TagCompanyModel
  })
  company!: CompanyModel[];
}
