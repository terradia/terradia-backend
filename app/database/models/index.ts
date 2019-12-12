import {Sequelize} from "sequelize-typescript";
import config from "../config";
import UserModel from "./user.model";
import ProductCategoryModel from "./product-cateogry.model";
import ProductModel from "./product.model";
import CompanyModel from "./company.model";
import CategoryModel from "./category.model";

const env = process.env.NODE_ENV || "development";
const currentConfig = config[env];

const initSequelize = async () => {
  let sequelize = await new Sequelize({
    ...currentConfig,
    dialectOptions: {
      ssl: true
    },
    models: [__dirname + "/**/*.model.ts"],
    native: false
  });
  sequelize.addModels([UserModel, ProductCategoryModel, ProductModel, CompanyModel, CategoryModel]);
  return sequelize;
};

export default initSequelize;
