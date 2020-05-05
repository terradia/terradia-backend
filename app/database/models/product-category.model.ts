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
import CategoryModel from "./category.model";
import ProductModel from "./product.model";

@Table({
  tableName: "ProductCategories",
  timestamps: false
})
export default class ProductCategoryModel extends Model<ProductCategoryModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @ForeignKey(() => ProductModel)
  @Column
  productId!: string;

  @ForeignKey(() => CategoryModel)
  @Column
  categoryId!: string;
}
