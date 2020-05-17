import {
  AfterFind,
  AllowNull,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  IsUUID,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import CategoryModel from "./category.model";
import ProductCategoryModel from "./product-category.model";
import ProductReviewModel from "./product-review.model";
import CompanyModel from "./company.model";
import CompanyProductsCategoryModel from "./company-products-category.model";
import CartProductModel from "./cart-product.model";
import UnitModel from "./unit.model";
import ProductCompanyImageModel from "./product-company-images.model";
import CompanyImageModel from "./company-image.model";

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

  // the cover points to the ManyToMany table because we want to ensure
  // that it's an image of the product and it's just a field mark one of the images
  // as different, nothing more.
  @ForeignKey(() => ProductCompanyImageModel)
  @Column
  coverId!: string;


  @BelongsToMany(
    () => CompanyImageModel,
    () => ProductCompanyImageModel
  )
  public images!: CompanyImageModel[];

  // categories of the products to make it easier to find it.
  @BelongsToMany(
    () => CategoryModel,
    () => ProductCategoryModel
  )
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

  // With this element you can get all the CartProducts created from this product
  // so know how much people got this product in their cart
  @HasMany(() => CartProductModel, "productId")
  public customerCartProducts!: CartProductModel[];

  @Column(DataType.FLOAT)
  public price!: number;

  @Column(DataType.INTEGER)
  public quantityForUnit!: number;

  @Column(DataType.INTEGER)
  public position!: number;

  @ForeignKey(() => UnitModel)
  @AllowNull(true)
  @Column(DataType.UUID)
  public unitId!: string;

  @BelongsTo(() => UnitModel)
  public unit!: UnitModel;

  public cover!: CompanyImageModel | null;

  public static async addCoverToProduct(
    product: ProductModel
  ): Promise<ProductModel> {
    if (product.coverId !== null) {
      const productCover: ProductCompanyImageModel | null = await ProductCompanyImageModel.findOne(
        {
          where: { id: product.coverId }
        }
      );
      if (productCover) {
        product.cover = await CompanyImageModel.findOne({
          where: { id: productCover.companyImageId }
        });
      }
    } else {
      product.cover = null;
    }
    return product;
  }

  @AfterFind
  static async afterFindHook(data: any) {
    if (data === undefined) return data;
    if (data.map !== undefined) {
      const products: ProductModel[] = data;
      return products.map(async product => {
        return ProductModel.addCoverToProduct(product);
      });
    } else {
      const product: ProductModel = data;
      return ProductModel.addCoverToProduct(product);
    }
  }
}
