import debug from "debug";
import chalk from "chalk";
import sequelize from "../models";
import CategoryModel from "../models/category.model";
import CompanyModel from "../models/company.model";
import CompanyProductsCategoryModel from "../models/company-products-category.model";
import CompanyReviewModel from "../models/company-review.model";
import CustomerModel from "../models/customer.model";
import CustomersFavoriteCompaniesModel from "../models/customers-favorite-companies.model";
import ProductModel from "../models/product.model";
import ProductCategoryModel from "../models/product-category.model";
import UserModel from "../models/user.model";
import {downRoles, upRoles} from "./roles";
import {downUsers, upUsers} from "./users";
import {downCompanies, upCompanies} from "./companies";
import {downProducts, upProducts} from "./products";
import {downCustomers, upCustomers} from "./customers";
import {downCompaniesReviews, upCompaniesReviews} from "./companyReviews";
import {downCustomersAddress, upCustomersAddress} from "./customerAddress"
import {downProductsReviews, upProductsReviews} from "./productReviews"
import {downCompanyProductsCategories, upCompanyProductsCategories} from "./companyProductsCategories"

// @ts-ignore
sequelize.addModels([
    CategoryModel,
    CompanyModel,
    CompanyProductsCategoryModel,
    CompanyReviewModel,
    CustomerModel,
    CustomersFavoriteCompaniesModel,
    ProductModel,
    ProductCategoryModel,
    UserModel
]);

export const up = async () => {
    try {
        await upRoles();
        await upUsers();
        await upCompanies();
        await upCompanyProductsCategories();
        await upProducts();
        await upCustomers();
        await upCompaniesReviews();
        await upCustomersAddress();
        await upProductsReviews();
        debug("init:seed")(chalk.green("Every seeds went well"));
        return process.exit();
    } catch (err) {
        throw err;
    }
};

export const down = async () => {
    await downRoles();
    await downUsers();
    await downCompanies();
    await downCompanyProductsCategories();
    await downProducts();
    await downCustomers();
    await downCompaniesReviews();
    await downProductsReviews();
    await downCustomersAddress();
    debug("init:seed")(chalk.green("All relevant data were erased"));
    return process.exit();
};
