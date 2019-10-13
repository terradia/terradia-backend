import {
    AllowNull,
    BelongsToMany,
    Column,
    DataType,
    Default,
    IsNull,
    IsUUID,
    Model,
    PrimaryKey,
    Table
} from "sequelize-typescript";
import ProductModel from "./product.model";
import ProductCategoryModel from "./product-cateogry.model";

@Table({
    tableName: "Categories",
    timestamps: false
})
export default class CategoryModel extends Model<CategoryModel> {

    @PrimaryKey
    @Default(DataType.NUMBER)
    @Column(DataType.NUMBER)
    public id: number;

    @Column
    public name: string;

    @AllowNull(true)
    @Column
    public parentCategoryId: number;

    @BelongsToMany(() => ProductModel, () => ProductCategoryModel)
    products: ProductModel[];
}