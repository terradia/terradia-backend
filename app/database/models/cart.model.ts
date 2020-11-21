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
import CartProductModel from "./cart-product.model";
import CompanyModel from "./company.model";
import CustomerModel from "./customer.model";

@Table({
  tableName: "Carts",
  timestamps: true
})
export default class CartModel extends Model<CartModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @HasMany(() => CartProductModel, "cartId")
  products!: CartProductModel[];

  @ForeignKey(() => CompanyModel)
  @AllowNull(false)
  @Column
  companyId!: string;

  @BelongsTo(() => CompanyModel)
  company!: CompanyModel;

  @ForeignKey(() => CustomerModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  customerId!: string;

  @BelongsTo(() => CustomerModel, "customerId")
  customer!: CustomerModel;

  @AllowNull(true)
  @Column(DataType.DATE)
  expirationDate!: Date | null;

  @Column(DataType.FLOAT)
  totalPrice!: number;

  @Column(DataType.INTEGER)
  numberProducts!: number;

  @Column
  public createdAt!: Date;

  @Column
  public updatedAt!: Date;
}
