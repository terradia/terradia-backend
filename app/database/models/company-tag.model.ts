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
import CompanyTagRelationsModel from "./company-tag-relations.model";

@Table({
  tableName: "CompanyTags",
  timestamps: false
})
export default class CompanyTagModel extends Model<CompanyTagModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  public slugName!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  public translationKey!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  public color!: string;

  @BelongsToMany(() => CompanyModel, {
    through: () => CompanyTagRelationsModel
  })
  companies!: CompanyModel[];
}
