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

@Table({
  tableName: "TagCompanyCategory",
  timestamps: false
})

export default class TagModel extends Model<TagModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @Column
  public name!: string;
}
