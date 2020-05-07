import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  IsUUID,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import CustomerModel from "./customer.model";

@Table({
  tableName: "CustomerAddresses",
  timestamps: false
})
export default class CustomerAddressModel extends Model<CustomerAddressModel> {
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

  @Column(DataType.GEOMETRY)
  public location!: any;

  @ForeignKey(() => CustomerModel)
  @Column
  public customerId!: string;

  @BelongsTo(() => CustomerModel)
  public customer!: CustomerModel;
}
