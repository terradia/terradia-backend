import {
  AllowNull,
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
import CompanyUserRoleModel from "./company-user-role.model";
import CompanyUserModel from "./company-user.model";
import UserPermissionsModel from "./userPermissions.model";
import CompanyProductsCategoryModel from "./company-products-category.model";
import ProductModel from "./product.model";

@Table({
  tableName: "Units",
  timestamps: false
})
export default class UnitModel extends Model<UnitModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @Column
  public name!: string;

  @Column
  public notation!: string;

  @BelongsTo(() => UnitModel, "referenceUnitId")
  public referenceUnit?: UnitModel;

  @HasMany(() => ProductModel, "unitId")
  public products!: ProductModel[];

  @ForeignKey(() => UnitModel)
  @AllowNull(true)
  @Column(DataType.STRING)
  public referenceUnitId!: string;

  @Column
  public multiplicationFactor?: number;
}
