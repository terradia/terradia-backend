import ProductModel from "../../database/models/product.model";
import UserModel from "../../database/models/user.model";
import CompanyModel from "../../database/models/company.model";
import CompanyReviewModel from "../../database/models/company-review.model";
import CompanyProductsCategoryModel from "../../database/models/company-products-category.model";
import CompanyUserModel from "../../database/models/company-user.model";
import RoleModel from "../../database/models/role.model";
import NodeGeocoder, { Geocoder } from "node-geocoder";
import { ApolloError } from "apollo-server-errors";
import { Op, Sequelize } from "sequelize";
import { Fn, Literal } from "sequelize/types/lib/utils";
import CompanyUserRoleModel from "../../database/models/company-user-role.model";
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated } from "./authorization";
import { uploadToS3SaveAsCompanyAvatarOrCover } from "../../uploadS3";
import CompanyImagesModel from "../../database/models/company-images.model";
import CompanyOpeningDayModel from "../../database/models/company-opening-day.model";
import CompanyOpeningDayHoursModel from "../../database/models/company-opening-day-hours.model";
import CompanyTagModel from "../../database/models/company-tag.model";

declare interface Point {
  type: string;
  coordinates: number[];
}

declare interface Context {
  user: UserModel;
}

declare interface CreateCompanyProps {
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  logo: { stream: Body; filename: string; mimetype: string; encoding: string };
  cover: { stream: Body; filename: string; mimetype: string; encoding: string };
}

export const toIncludeWhenGetCompany = [
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
  {
    model: CompanyOpeningDayModel,
    include: [CompanyOpeningDayHoursModel]
  },
  CompanyTagModel
];

export default {
  Query: {
    getAllCompanies: async (
      _: any,
      { page, pageSize }: { page: number; pageSize: number }
    ): Promise<CompanyModel[]> => {
      const comp = await CompanyModel.findAll({
        include: [
          { model: CompanyImagesModel, as: "logo" },
          ProductModel,
          {
            model: CompanyUserModel,
            include: [RoleModel, UserModel]
          },
          CompanyReviewModel,
          {
            model: CompanyProductsCategoryModel,
            include: [ProductModel]
          },
          {
            model: CompanyOpeningDayModel,
            include: [CompanyOpeningDayHoursModel]
          }
        ],
        offset: page * pageSize,
        limit: pageSize
      });
      return comp;
    },
    getCompany: async (
      _: any,
      { companyId }: { companyId: string }
    ): Promise<CompanyModel | null> => {
      const company = CompanyModel.findByPk(companyId, {
        include: [
          { model: CompanyImagesModel, as: "logo" },
          { model: CompanyImagesModel, as: "cover" },
          { model: CompanyImagesModel, as: "companyImages" },
          ProductModel,
          {
            model: CompanyUserModel,
            include: [RoleModel, UserModel]
          },
          CompanyReviewModel,
          {
            model: CompanyProductsCategoryModel,
            include: [ProductModel]
          },
          {
            model: CompanyOpeningDayModel,
            include: [CompanyOpeningDayHoursModel]
          }
        ]
      });
      if (!company) throw new ApolloError("This company does not exist", "404");
      return company;
    },
    getCompanyByName: async (
      _: any,
      { name }: { name: string }
    ): Promise<CompanyModel | null> => {
      return CompanyModel.findOne({
        where: { name },
        include: toIncludeWhenGetCompany
      });
    },
    getCompaniesByDistance: async (
      _: any,
      {
        page,
        pageSize,
        lat,
        lon
      }: { page: number; pageSize: number; lat: number; lon: number }
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
        attributes: { include: [[distance, "distance"]] },
        include: toIncludeWhenGetCompany,
        order: distance,
        offset: page,
        limit: pageSize
      });
    },
    getCompanies: async (
      _: any,
      __: any,
      { user }: { user: UserModel }
    ): Promise<CompanyModel[]> => {
      const userFetched: UserModel | null = await UserModel.findByPk(user.id, {
        include: [
          {
            model: CompanyUserModel,
            include: [CompanyModel]
          }
        ]
      });
      if (userFetched) {
        return userFetched.companies.map(companyInfo => {
          return companyInfo.company;
        });
      }
      throw new ApolloError("User not found");
    },
    getCompaniesByUser: async (
      _: any,
      { userId }: { userId: string }
    ): Promise<CompanyUserModel[] | undefined> => {
      return (
        await UserModel.findByPk(userId, {
          include: [
            {
              model: CompanyUserModel,
              include: [CompanyModel]
            }
          ]
        })
      )?.companies;
    },
    searchCompanies: async (
      _: any,
      { query }: { query: string },
      { user }: { user: UserModel }
    ): Promise<CompanyModel[]> => {
      const comp = await CompanyModel.findAll({
        //TODO: Search by tag
        //https://stackoverflow.com/questions/31258158/how-to-implement-search-feature-using-sequelizejs/37326395
        where: {
          [Op.or]: [{ name: { [Op.iLike]: "%" + query + "%" } }]
        },
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
        ]
      });
      return comp;
    },
    getCompanyImages: async (
      _: any,
      {
        companyId,
        page = 0,
        pageSize = 15
      }: { companyId: string; page: number; pageSize: number },
      __: any
    ): Promise<CompanyImagesModel[]> => {
      return CompanyImagesModel.findAll({
        where: { companyId },
        limit: pageSize,
        offset: page * pageSize
      });
    }
  },
  Mutation: {
    createCompany: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        args: CreateCompanyProps,
        { user }: Context
      ): Promise<CompanyModel> => {
        //TODO Check if user is null for every function that use the user as context
        let point: Point = {
          type: "",
          coordinates: []
        };
        const geocoder: Geocoder = NodeGeocoder({ provider: "openstreetmap" });
        await geocoder.geocode(args.address, function(err, res) {
          if (err)
            throw new ApolloError(
              "Error while get geo data from address",
              "500"
            );
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
        if (args.logo) {
          const { stream, filename } = await args.logo;
          uploadToS3SaveAsCompanyAvatarOrCover(
            filename,
            stream,
            newCompany.id,
            true
          );
        }
        if (args.cover) {
          const { stream, filename } = await args.cover;
          uploadToS3SaveAsCompanyAvatarOrCover(
            filename,
            stream,
            newCompany.id,
            false
          );
        }
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
      }
    ),
    joinCompany: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        { companyId, userId }: { companyId: string; userId: string }
      ): Promise<CompanyModel | null> => {
        const company: CompanyModel | null = await CompanyModel.findOne({
          where: { id: companyId }
        });
        if (!company)
          throw new ApolloError(
            "The company does not exists", // TODO : translate
            "404"
          );
        const companyUser = await CompanyUserModel.findOne({
          where: {
            companyId,
            userId
          }
        });
        if (companyUser !== null)
          throw new ApolloError(
            "This user has already joined the company", // TODO : translate
            "403"
          );
        const userRole: RoleModel | null = await RoleModel.findOne({
          where: { slugName: "member" }
        });
        if (userRole == null) {
          throw new ApolloError("Cannot find the role 'Member'", "500"); // TODO : translate
        }
        await CompanyUserModel.create({
          companyId,
          userId
        }).then(userCompany => {
          CompanyUserRoleModel.create({
            companyUserId: userCompany.id,
            roleId: userRole.id
          });
        });
        return CompanyModel.findByPk(companyId);
      }
    ),
    leaveCompany: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        { companyId }: { companyId: string },
        { user }: Context
      ): Promise<CompanyModel | null> => {
        const userId: string = user.id;
        const company: CompanyModel | null = await CompanyModel.findOne({
          where: { id: companyId }
        });
        if (!company)
          throw new ApolloError(
            "The company does not exists", // TODO : translate
            "404"
          );
        const companyUser: CompanyUserModel | null = await CompanyUserModel.findOne(
          { where: { companyId: companyId, userId: userId } }
        );
        if (companyUser === null) {
          throw new ApolloError("This user is not in the company", "400");
        }
        CompanyUserRoleModel.destroy({
          where: { companyUserId: companyUser.id }
        });
        companyUser.destroy();
        return CompanyModel.findByPk(companyId);
      }
    )
  }
};
