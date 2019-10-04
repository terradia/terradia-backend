import {BelongsToMany, Column, DataType, Default, IsUUID, Model, PrimaryKey, Table} from "sequelize-typescript";
import ProductModel from "./product.model";
import ProductCategoryModel from "./product-cateogry.model";

@Table({
    tableName: "Categories",
    timestamps: true
})
export default class CategoryModel extends Model<CategoryModel> {

    @PrimaryKey
    @Default(DataType.NUMBER)
    @Column(DataType.NUMBER)
    public id: number;

    @Column
    public name: string;

    @Column
    public parentCategoryId: number;

    @BelongsToMany(() => ProductModel, () => ProductCategoryModel)
    products: ProductModel[];
}