import ProductModel from "../../database/models/product.model";
import UserModel from "../../database/models/user.model";
import CompanyModel from "../../database/models/company.model";
import CompanyReviewModel from "../../database/models/company-review.model";
import CompanyProductsCategoryModel from "../../database/models/company-products-category.model";
import CompanyUserModel from "../../database/models/company-user.model";
import RoleModel from "../../database/models/role.model";
import { UserInputError } from "apollo-server-express";
import sequelize from "../../database/models";
import NodeGeocoder from "node-geocoder";
import { ApolloError } from "apollo-server-errors";
import TagCompanyCategoryModel from "../../database/models/tag-company-category.model";
import TagCompanyModel from "../../database/models/tag-company.model";

interface addTagCategoryToCompanyArgs {
  companyId: string;
  tagName: string;
}

interface getAllCompaniesArguments {
  page: number;
  pageSize: number;
}

export default {
  Query: {
    getAllCompanies: async (
      _parent: any,
      { page, pageSize }: { page: number; pageSize: number }
    ) => {
      let companies = await CompanyModel.findAll({
        include: [
          ProductModel,
          {
            model: CompanyUserModel,
            include: [RoleModel, UserModel]
          },
          CompanyReviewModel,
          {
            model: CompanyProductsCategoryModel,
            include: [ProductModel]
          }
        ],
        offset: page,
        limit: pageSize
      });
      return companies;
    },
    getCompany: async (_parent: any, { companyId }: { companyId: string }) => {
      let company = await CompanyModel.findByPk(companyId, {
        include: [
          ProductModel,
          {
            model: CompanyUserModel,
            include: [RoleModel, UserModel]
          },
          CompanyReviewModel,
          {
            model: CompanyProductsCategoryModel,
            include: [ProductModel]
          }
        ]
      });
      return company;
    },
    getCompanyByName: async (_parent, { name }: { name: string }) => {
      return CompanyModel.findOne({
        where: { name },
        include: [
          ProductModel,
          {
            model: CompanyUserModel,
            include: [RoleModel, UserModel]
          },
          CompanyReviewModel,
          {
            model: CompanyProductsCategoryModel,
            include: [ProductModel]
          }
        ]
      });
    },
    getCompaniesByDistance: async (
      _parent: any,
      {
        page,
        pageSize,
        lat,
        lon
      }: { page: number; pageSize: number; lat: number; lon: number }
    ) => {
      const location = sequelize.literal(
        `ST_GeomFromText('POINT(${lat} ${lon})')`
      );
      const distance = sequelize.fn(
        "ST_DistanceSphere",
        sequelize.col("position"),
        location
      );

      const companies = await CompanyModel.findAll({
        attributes: { include: [[distance, "distance"]] },
        include: [
          ProductModel,
          {
            model: CompanyUserModel,
            include: [RoleModel, UserModel]
          },
          {
            model: CompanyProductsCategoryModel,
            include: [ProductModel]
          },
          CompanyReviewModel,
          CompanyProductsCategoryModel
        ],
        order: distance,
        offset: page,
        limit: pageSize
      });
      return companies.map(element => {
        return element.toJSON();
      });
    }
  },
  Mutation: {
    createCompany: async (
      _parent: any,
      _args: {
        name: string;
        description: string;
        email: string;
        phone: string;
        address: string;
      },
      { user }: { user: UserModel }
    ) => {
      let point = undefined;
      let geocoder = NodeGeocoder({ provider: "openstreetmap" });
      await geocoder.geocode(_args.address, function(err, res) {
        if (err)
          throw new ApolloError("Error while get geo data from address", "500");
        point = {
          type: "Point",
          coordinates: [
            parseFloat(res[0].longitude),
            parseFloat(res[0].latitude)
          ]
        };
      });
      const ownerRole = await RoleModel.findOne({
        where: { slugName: "owner" }
      }).then(elem => elem);
      if (ownerRole == null)
        throw new ApolloError(
          "There is no owner Role in DB, cannot create Company. Try to seed the DB.",
          500
        );
      const newCompany = await CompanyModel.create({
        ..._args,
        position: point
      }).toJSON();
      await CompanyUserModel.create({
        companyId: newCompany.id,
        userId: user.id,
        role: ownerRole.id
      }).then(userCompany => {
        userCompany.addRole(ownerRole.id);
      });
      return newCompany;
    },
    joinCompany: async (
      _parent,
      { companyId, userId },
      { user }: { user: UserModel }
    ) => {
      const userRole = await RoleModel.findOne({ where: { slugName: "user" } });
      await CompanyUserModel.create({
        companyId,
        userId,
        role: userRole.id
      }).then(userCompany => {
        userCompany.addRole(userRole.id);
      });
      return CompanyModel.findByPk(companyId);
    },
    leaveCompany: async (
      _parent,
      { companyId, userId },
      { user }: { user: UserModel }
    ) => {
      let companyUser = await CompanyUserModel.destroy({
        where: {
          userId
        }
      );
      return newCompany.toJSON();
    },
    addTagCategoryToCompany: async (
      _parent: any,
      { companyId, tagName }: addTagCategoryToCompanyArgs
    ) => {
      let tagCompany = await TagCompanyModel.findOne({
        where: { name: tagName }
      });
      if (tagCompany) {
        // findOrCreate so that it doesn't add multiple times the tagCompany to a product.
        await TagCompanyCategoryModel.findOrCreate({
          where: {
            companyId,
            categoryId: tagCompany.id
          }
        });
      } else {
        throw new Error(`The tagCompany ${tagName} doesn't exists.`);
      }
      let company = await CompanyModel.findOne({
        where: { id: companyId },
        include: [TagCompanyModel]
      });
      return company ? company.toJSON() : null;
    }
  }
};
