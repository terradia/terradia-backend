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

  @Column
  public name!: string;

  @AllowNull(true)
  @Column
  public parentCategoryId!: number;

  @BelongsToMany(() => ProductModel, {
    onDelete: "CASCADE",
    through: () => ProductCategoryModel
  })
  products!: ProductModel[];
}
