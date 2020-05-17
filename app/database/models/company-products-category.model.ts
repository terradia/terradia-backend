import {
  AfterFind,
  BelongsTo,
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
import ProductModel from "./product.model";
import CompanyModel from "./company.model";

@Table({
  tableName: "CompanyProductsCategories",
  timestamps: false
})
export default class CompanyProductsCategoryModel extends Model<
  CompanyProductsCategoryModel
> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @Column(DataType.STRING)
  public name!: string;

  @ForeignKey(() => CompanyModel)
  @Column
  companyId!: string;

  @BelongsTo(() => CompanyModel)
  public company!: CompanyModel;

  @HasMany(() => ProductModel)
  public products!: ProductModel[];

  @AfterFind
  static async afterFindHook(data: any) {
    if (data === undefined) return data;
    if (data.map !== undefined) {
      const categories: CompanyProductsCategoryModel[] = data;
      return categories.map(async category => {
        if (!category.products) return category;
        const products = await category.products.map(
          async (product: ProductModel) => {
            const res = await ProductModel.addCoverToProduct(product);
            if (product.coverId !== null) console.log(res);
            return res;
          }
        );
        category.products = products;
        return category;
      });
    } else {
      const category: CompanyProductsCategoryModel = data;
      category.products = await category.products.map(
        async (product: ProductModel) => {
          const res = await ProductModel.addCoverToProduct(product);
          if (product.coverId !== null) console.log(res);
          return res;
        }
      );
      return category;
    }
  }
}
