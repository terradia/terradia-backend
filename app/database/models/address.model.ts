import {
  addHook, BeforeBulkCreate, BeforeCreate, BeforeValidate,
  BelongsTo,
  Column, DataType, Default,
  ForeignKey, HookOptions, IsUUID,
  Model, PrimaryKey,
  Table
} from "sequelize-typescript";
import CustomerModel from "./customer.model";

@Table({
  tableName: "Addresses",
  timestamps: false
})
export default class AddressModel extends Model<AddressModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @Column
  public address!: string;

  @Column
  public apartment!: string;

  @Column
  public information!: string;

  @Column
  public active!: boolean;

  @ForeignKey(() => CustomerModel)
  @Column
  public customerId!: string;

  @BelongsTo(() => CustomerModel)
  public customer!: CustomerModel;

}
