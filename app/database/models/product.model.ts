import {
    BelongsToMany,
    Column,
    DataType,
    Default,
    IsUUID,
    Model,
    PrimaryKey,
    Table
} from "sequelize-typescript";
import CategoryModel from "./category.model";
import ProductCategoryModel from "./product-cateogry.model";

@Table({
    tableName: "Products",
    timestamps: true
})
export default class ProductModel extends Model<ProductModel> {
    @IsUUID(4)
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    public id: string;

    @Column
    public name: string;

    @Column
    public description: string;

    @BelongsToMany(() => CategoryModel, () => ProductCategoryModel)
    categories: CategoryModel[];
}
