import ProductModel from "../../database/models/product.model";
import UserModel from "../../database/models/user.model";
import CompanyModel from "../../database/models/company.model";
import CompanyReviewModel from "../../database/models/company-review.model";
import CompanyProductsCategoryModel from "../../database/models/company-products-category.model";
import CompanyUserModel from "../../database/models/company-user.model";
import RoleModel from "../../database/models/role.model";
import {UserInputError} from "apollo-server-express";
import NodeGeocoder, {Geocoder} from "node-geocoder";
import {ApolloError} from "apollo-server-errors";
import {Sequelize} from "sequelize";
import {Fn, Literal} from "sequelize/types/lib/utils";
import CompanyUserRoleModel from "../../database/models/company-user-role.model";

declare interface Point {
  type: string,
  coordinates: number[]
}

declare interface Context {
  user: UserModel
}

declare interface CreateCompanyProps {
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
}

export default {
  Query: {
    getAllCompanies: async (_: any, { page, pageSize }: { page: number; pageSize: number }): Promise<CompanyModel[]> => {
      return CompanyModel.findAll({
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
    },
    getCompany: async (_: any, { companyId }: { companyId: string }): Promise<CompanyModel | null> => {
      return CompanyModel.findByPk(companyId, {
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
    getCompanyByName: async (_: any, { name }: { name: string }): Promise<CompanyModel | null> => {
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
    getCompaniesByDistance: async (_: any, {page, pageSize, lat, lon}:
                                       { page: number; pageSize: number; lat: number; lon: number }
    ): Promise<CompanyModel[]> => {
      const location: Literal = Sequelize.literal(
        `ST_GeomFromText('POINT(${lat} ${lon})')`
      );
      const distance: Fn = Sequelize.fn(
        "ST_DistanceSphere",
        Sequelize.col("position"),
        location
      );

      return CompanyModel.findAll({
        attributes: {include: [[distance, "distance"]]},
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
    },
    getCompanies: async (_: any, __: any, { user }: { user: UserModel }): Promise<CompanyModel[]> => {
      return user.companies.map(companyInfo => {
        return companyInfo.company;
      })
    },
    getCompaniesByUser: async (_: any, {userId}: {userId: string}): Promise<CompanyUserModel[] | undefined> => {
      return (await UserModel.findByPk(userId, {
        include: [
          {
            model: CompanyUserModel, include: [
              CompanyModel
            ]
          }
        ]
      }))?.companies;
    }
    //TODO create getCompanyUsers
  },
  Mutation: {
    createCompany: async (
        _: any,
      args: CreateCompanyProps,
      {user}: Context
    ): Promise<CompanyModel> => {
      //TODO Check if user is null for every function that use the user as context
      let point: Point = {
        type: "",
        coordinates: []
      };
      let geocoder: Geocoder = NodeGeocoder({ provider: "openstreetmap" });
      await geocoder.geocode(args.address, function(err, res) {
        if (err)
          throw new ApolloError("Error while get geo data from address", "500");
        point = {
          type: "Point",
          coordinates: [
            parseFloat(String(res[0].longitude)),
            parseFloat(String(res[0].latitude))
          ]
        };
      });
      const ownerRole: RoleModel | null = await RoleModel.findOne({
        where: { slugName: "owner" }
      }).then(elem => elem);
      if (ownerRole == null)
        throw new ApolloError(
          "There is no owner Role in the DB, cannot create Company. Try to seed the DB.",
          "500"
        );
      const newCompany: CompanyModel = await CompanyModel.create({
        ...args,
        position: point
      });
      await CompanyUserModel.create({
        // @ts-ignore
        companyId: newCompany.id,
        userId: user.id,
        role: ownerRole.id
      }).then(userCompany => {
        // @ts-ignore
        userCompany.addRole(ownerRole.id);
      });
      return newCompany;
    },
    joinCompany: async (_: any, {companyId, userId}: {companyId: string, userId: string}): Promise<CompanyModel | null> => {
      // TODO Check if the user exist in the company
      const userRole: RoleModel | null = await RoleModel.findOne({ where: { slugName: "member" } });
      if (userRole == null) {
        throw new ApolloError("can't find the user role", "500");
      }
      await CompanyUserModel.create({
        companyId,
        userId,
      }).then(userCompany => {
        CompanyUserRoleModel.create({
          companyUserId: userCompany.id,
          roleId: userRole.id
        });
      });
      return CompanyModel.findByPk(companyId);
    },
    leaveCompany: async (_: any, {companyId, userId}: {companyId: string, userId: string}): Promise<CompanyModel | null> => {
      const companyUser: CompanyUserModel | null = await CompanyUserModel.findOne({where: {companyId: companyId, userId: userId}});
      if (companyUser == null) {
        throw new UserInputError("User not found");
      }
      CompanyUserRoleModel.destroy({where: {companyUserId: companyUser.id}});
      companyUser.destroy();
      return CompanyModel.findByPk(companyId);
    }
  }
};
