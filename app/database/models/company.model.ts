import {
  AllowNull,
  HasMany,
  Column,
  DataType,
  Default,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
  BelongsToMany,
  AfterFind,
  HasOne,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import ProductModel from "./product.model";
import CompanyReviewModel from "./company-review.model";
import CustomerModel from "./customer.model";
import CustomersFavoriteCompaniesModel from "./customers-favorite-companies.model";
import CompanyProductsCategoryModel from "./company-products-category.model";
import CompanyUserModel from "./company-user.model";
import CartModel from "./cart.model";
import CompanyOpeningDayModel from "./company-opening-day.model";
import CompanyImagesModel from "./company-image.model";
import CompanyTagModel from "./company-tag.model";
import CompanyTagRelationsModel from "./company-tag-relations.model";

@Table({
  tableName: "Companies",
  timestamps: true
})
export default class CompanyModel extends Model<CompanyModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @Column(DataType.STRING)
  public name!: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  public description!: string;

  // to contact the company easily
  @Column(DataType.STRING)
  public email!: string;

  // to contact the company easily
  @Column(DataType.STRING)
  public phone!: string;

  @ForeignKey(() => CompanyImagesModel)
  @Column
  logoId!: string;
  // A string because to get the images you should get them from the media server of Terradia
  // https://media.terradia.eu/ + company.logo
  @BelongsTo(() => CompanyImagesModel)
  public logo!: string;

  // A string because to get the images you should get them from the media server of Terradia
  // https://media.terradia.eu/ + company.cover
  @ForeignKey(() => CompanyImagesModel)
  @Column
  coverId!: string;

  @BelongsTo(() => CompanyImagesModel)
  public cover!: string;

  // @HasMany(() => UserModel)
  // public users!: UserModel[];

  // This way we can get all the products independently of their categories
  // the second usage is that we can have projects without categories to "hide them"
  @HasMany(() => CompanyImagesModel)
  public companyImages!: CompanyImagesModel[];

  @HasMany(() => ProductModel)
  public products!: ProductModel[];

  // the categories of the products of the company
  @HasMany(() => CompanyProductsCategoryModel)
  public productsCategories!: CompanyProductsCategoryModel[];

  // All the reviews of the company
  @HasMany(() => CompanyReviewModel)
  public reviews!: CompanyReviewModel[];

  // All company users
  @HasMany(() => CompanyUserModel)
  public users!: CompanyUserModel[];

  // all the users that made favorite this company => could be usefull for big companies to find
  // people to do promotions of their companies (if the users said he want to do that or other...)
  @BelongsToMany(
    () => CustomerModel,
    () => CustomersFavoriteCompaniesModel
  )
  public customersFavorites!: CustomerModel[];

  // Mark average the company get from the customers reviews.
  @Column(DataType.NUMBER)
  public averageMark!: number;

  // Number of marks given to the company to calculate the average mark and the also know the number of people that
  // rated the company.
  @Column(DataType.NUMBER)
  public numberOfMarks!: number;

  @Column(DataType.GEOMETRY)
  public geoPosition!: any;

  @Column(DataType.STRING)
  public address!: string;

  @HasMany(() => CartModel, "companyId")
  public customersCarts!: CartModel[];

  // the opening days of the company
  @HasMany(() => CompanyOpeningDayModel, "companyId")
  public openingDays!: CompanyOpeningDayModel[];

  @BelongsToMany(
    () => CompanyTagModel,
    () => CompanyTagRelationsModel
  )
  public tags!: CompanyTagModel[];

  @Column
  public createdAt!: Date;

  @Column
  public updatedAt!: Date;

  @Column(DataType.VIRTUAL)
  public distance!: number;

  @Column(DataType.DATE)
  public archivedAt!: Date;

  // @AfterFind
  // static afterFindHook(result: any): void {
  //   if(result.constructor === Array) {
  //     let arrayLength = result.length;
  //     for (let i = 0; i < arrayLength; i++) {
  //       result[i].logo = process.env.__S3_URL__ + result[i].logo;
  //     }
  //   } else {
  //     result.logo = process.env.__S3_URL__ + result.logo;
  //   }
  //   return result;
  // }
}
