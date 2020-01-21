import {
    BelongsToMany,
    Column,
    DataType,
    Default,
    IsUUID,
    Model,
    PrimaryKey,
    BelongsTo,
    Table, ForeignKey, HasMany
} from "sequelize-typescript";
import CategoryModel from "./category.model";
import ProductCategoryModel from "./product-category.model";
import CompanyModel from "./company.model";
import CompanyProductsCategoryModel from "./company-products-category.model";

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

    @Column
    public name!: string;

    @Column
    public description!: string;

    // A string because to get the images you should get them from the media server of Terradia
    // https://media.terradia.eu/ + company.image
    @Column
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

}
