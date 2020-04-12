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
import ProductModel from "./product.model";
import ProductCategoryModel from "./product-category.model";

@Table({
  tableName: "Categories",
  timestamps: false
})
export default class CategoryModel extends Model<CategoryModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @Column(DataType.STRING)
  public name!: string;

  //TODO TO refactor, Id can't be a number
  @AllowNull(true)
  @Column(DataType.NUMBER)
  public parentCategoryId!: string;

  @BelongsToMany(() => ProductModel, {
    onDelete: "CASCADE",
    through: () => ProductCategoryModel
  })
  products!: ProductModel[];
}
