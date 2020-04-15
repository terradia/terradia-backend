import {
  BelongsToMany,
  Column,
  DataType,
  Default,
  IsUUID,
  Model,
  PrimaryKey,
  BelongsTo,
  Table,
  ForeignKey,
  HasMany, HasOne, AllowNull
} from "sequelize-typescript";
import CategoryModel from "./category.model";
import ProductCategoryModel from "./product-category.model";
import ProductReviewModel from "./product-review.model";
import CompanyModel from "./company.model";
import CompanyProductsCategoryModel from "./company-products-category.model";
import BasketModel from "./basket.model";
import BasketProductModel from "./basket-product.model";
import UnitModel from "./unit.model";
import { Col } from "sequelize/types/lib/utils";

@Table({
  tableName: "Products",
  timestamps: true
})
export default class ProductModel extends Model<ProductModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @Column(DataType.STRING)
  public name!: string;

  @Column(DataType.STRING)
  public description!: string;

  // A string because to get the images you should get them from the media server of Terradia
  // https://media.terradia.eu/ + company.image
  @Column(DataType.STRING)
  public image!: string;

  // categories of the products to make it easier to find it.
  @BelongsToMany(() => CategoryModel, () => ProductCategoryModel)
  public categories!: CategoryModel[];

  @Column
  public createdAt!: Date;

  @Column
  public updatedAt!: Date;

  // id of the product's company
  @ForeignKey(() => CompanyModel)
  @Column
  companyId!: string;

  // The company of the product
  // We keep the company and even if we can find it from the companyProductsCategory because we want the product to
  // be in the company without a category if the company want to hide products or doesn't need categories.
  @BelongsTo(() => CompanyModel)
  public company!: CompanyModel;

  // id of the company products category
  @ForeignKey(() => CompanyProductsCategoryModel)
  @Column
  companyProductsCategoryId!: string;

  // The company products category of the product
  @BelongsTo(() => CompanyProductsCategoryModel)
  public companyProductsCategory!: CompanyProductsCategoryModel;

  @HasMany(() => ProductReviewModel)
  public reviews!: ProductReviewModel[];

  // Mark average the product get from the customers reviews.
  @Column(DataType.NUMBER)
  public averageMark!: number;

  // Number of marks given to the product to calculate the average mark and the also know the number of people that
  // rated the company.
  @Column(DataType.NUMBER)
  public numberOfMarks!: number;

  // With this element you can get all the BasketProducts created from this product
  // so know how much people got this product in their basket
  @HasMany(() => BasketProductModel, "productId")
  public customerBasketProducts!: BasketProductModel[];

  @Column(DataType.FLOAT)
  public price!: number;

  @Column(DataType.INTEGER)
  public quantityForUnit!: number;

  @ForeignKey(() => UnitModel)
  @AllowNull(true)
  @Column(DataType.UUID)
  public unitId!: string;

  @BelongsTo(() => UnitModel)
  public unit!: UnitModel;
}
