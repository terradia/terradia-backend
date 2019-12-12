import {
    Column,
    ForeignKey,
    Model,
    Table
} from "sequelize-typescript";
import CategoryModel from "./category.model";
import ProductModel from "./product.model";

@Table({
    tableName: "ProductCategories",
    timestamps: false
})
export default class ProductCategoryModel extends Model<ProductCategoryModel> {
    @ForeignKey(() => ProductModel)
    @Column
    productId!: string;

    @ForeignKey(() => CategoryModel)
    @Column
    categoryId!: string;
}
