import {
    BelongsToMany,
    Column,
    DataType,
    Default,
    IsUUID,
    Model,
    PrimaryKey,
    BelongsTo,
    Table, ForeignKey
} from "sequelize-typescript";
import CategoryModel from "./category.model";
import ProductCategoryModel from "./product-cateogry.model";
import CompanyModel from "./company.model";

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

    @Column
    public image!: string;

    @BelongsToMany(() => CategoryModel, () => ProductCategoryModel)
    public categories!: CategoryModel[];

    @Column
    public createdAt!: Date;

    @Column
    public updatedAt!: Date;

    @ForeignKey(() => CompanyModel)
    @Column
    companyId!: string;

    @BelongsTo(() => CompanyModel)
    public company!: CompanyModel;
}
