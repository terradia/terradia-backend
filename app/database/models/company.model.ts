import {
  AllowNull,
  HasMany,
  Column,
  DataType,
  Default,
  IsUUID,
  Model,
  PrimaryKey,
  Table, BelongsToMany, AfterFind
} from "sequelize-typescript";
import ProductModel from "./product.model";
import UserModel from "./user.model";
import CompanyReviewModel from "./company-review.model";
import CustomerModel from "./customer.model";
import CustomersFavoriteCompaniesModel from "./customers-favorite-companies.model";
import CompanyProductsCategoryModel from "./company-products-category.model";

@Table({
  tableName: "Companies",
  timestamps: false
})
export default class CompanyModel extends Model<CompanyModel> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id!: string;

  @Column
  public name!: string;

  @AllowNull(true)
  @Column
  public description!: string;

  // to contact the company easily
  @Column
  public email!: string;

  // to contact the company easily
  @Column
  public phone!: string;

  // A string because to get the images you should get them from the media server of Terradia
  // https://media.terradia.eu/ + company.logo
  @Column
  public logo!: string;

  // A string because to get the images you should get them from the media server of Terradia
  // https://media.terradia.eu/ + company.cover
  @Column
  public cover!: string;

  @HasMany(() => UserModel)
  public users!: UserModel[];

  // This way we can get all the products independently of their categories
  // the second usage is that we can have projects without categories to "hide them"
  @HasMany(() => ProductModel)
  public products!: ProductModel[];

  // the categories of the products of the company
  @HasMany(() => CompanyProductsCategoryModel)
  public productsCategories!: CompanyProductsCategoryModel[];

  // All the reviews of the company
  @HasMany(() => CompanyReviewModel)
  public reviews!: CompanyReviewModel[];

  // all the users that made favorite this company => could be usefull for big companies to find
  // people to do promotions of their companies (if the users said he want to do that or other...)
  @BelongsToMany(() => CustomerModel, () => CustomersFavoriteCompaniesModel)
  public customersFavorites!: CustomerModel[];

  // Mark average the company get from the customers reviews.
  @Column
  public averageMark!: number;

  // Number of marks given to the company to calculate the average mark and the also know the number of people that
  // rated the company.
  @Column
  public numberOfMarks!: number;

  @Column
  public createdAt!: Date;

  @Column
  public updatedAt!: Date;

  @AfterFind
  static afterFindHook(result: any): void {
    if(result.constructor === Array) {
      let arrayLength = result.length;
      for (let i = 0; i < arrayLength; i++) {
        result[i].logo = process.env.__S3_URL__ + result[i].logo;
      }
    } else {
      result.logo = process.env.__S3_URL__ + result.logo;
    }
    return result;
  }
}
