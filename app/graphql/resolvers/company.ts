import ProductModel from "../../database/models/product.model";
import UserModel from "../../database/models/user.model";
import CompanyModel from "../../database/models/company.model";
import CompanyReviewModel from "../../database/models/company-review.model";
import CompanyProductsCategoryModel from "../../database/models/company-products-category.model";
import CompanyUserModel from "../../database/models/company-user.model";
import RoleModel from "../../database/models/role.model";
import companyUser from "../schema/companyUser";
import { UserInputError } from "apollo-server-express";
// @ts-ignore
import sequelize from "../../database/models";
import NodeGeocoder from "node-geocoder";
import { ApolloError } from "apollo-server-errors";

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
          UserModel,
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
        throw new ApolloError("There is no owner Role in DB, cannot create Company. Try to seed the DB.", 500);
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
      })
        .then(data => {
          if (data === 0) throw new UserInputError("User not found in company");
        })
        .error(error => {
          throw new UserInputError(error);
        });
      return CompanyModel.findByPk(companyId);
    }
  }
};
