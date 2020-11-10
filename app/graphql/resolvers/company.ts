import ProductModel from "../../database/models/product.model";
import UserModel from "../../database/models/user.model";
import CompanyModel from "../../database/models/company.model";
import CompanyReviewModel from "../../database/models/company-review.model";
import CompanyProductsCategoryModel from "../../database/models/company-products-category.model";
import CompanyUserModel from "../../database/models/company-user.model";
import RoleModel from "../../database/models/role.model";
import NodeGeocoder, { Geocoder } from "node-geocoder";
import { ApolloError } from "apollo-server-errors";
import fetch from "node-fetch";
import { Op, Sequelize } from "sequelize";
import { Fn, Literal } from "sequelize/types/lib/utils";
import CompanyUserRoleModel from "../../database/models/company-user-role.model";
import { combineResolvers, pipeResolvers } from "graphql-resolvers";
import { isAuthenticated, isUserAndCustomer } from "./authorization";
import CompanyImageModel from "../../database/models/company-image.model";
import CompanyOpeningDayModel from "../../database/models/company-opening-day.model";
import CompanyOpeningDayHoursModel from "../../database/models/company-opening-day-hours.model";
import CompanyTagModel from "../../database/models/company-tag.model";
import CustomerAddressModel from "../../database/models/customer-address.model";
import CustomerModel from "../../database/models/customer.model";
import CompanyDeliveryDayModel from "../../database/models/company-delivery-day.model";
import CompanyDeliveryDayHoursModel from "../../database/models/company-delivery-day-hours.model";

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
  siren: string;
  logo: { stream: Body; filename: string; mimetype: string; encoding: string };
  cover: { stream: Body; filename: string; mimetype: string; encoding: string };
  officialName?: string;
}

const checkSiren: (siren: string) => Promise<string> = async (
  siren: string
) => {
  const json = await fetch(
    process.env.INSEE_SIREN_URL + siren + "?masquerValeursNulles=true",
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + process.env.INSEE_API_TOKEN
      }
    }
  ).then(async res => {
    if (!res.ok) return null;
    return await res.json();
  });
  if (json === null) return null;
  const activityCode =
    json.uniteLegale.periodesUniteLegale["0"].activitePrincipaleUniteLegale;
  if (!activityCode.startsWith("01"))
    throw new ApolloError("Company don't have a producer activity.", "400");
  return json.uniteLegale.periodesUniteLegale["0"].denominationUniteLegale;
};

export const companyIncludes = [
  { model: CompanyImageModel, as: "logo" },
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
  },
  {
    model: CompanyDeliveryDayModel,
    include: [CompanyDeliveryDayHoursModel]
  }
];

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
  {
    model: CompanyReviewModel,
    include: [{ model: CustomerModel, include: [UserModel] }]
  },
  {
    model: CompanyOpeningDayModel,
    include: [CompanyOpeningDayHoursModel]
  },
  {
    model: CompanyDeliveryDayModel,
    include: [CompanyDeliveryDayHoursModel]
  },
  CompanyTagModel,
  { model: CompanyImageModel, as: "logo" },
  { model: CompanyImageModel, as: "cover" }
];

export const isValidSiren = async (
  _: any,
  { siren }: { siren: string }
): Promise<any> => {
  console.log("isValidSiren");
  const json = await fetch(
    process.env.INSEE_SIREN_URL + siren + "&masquerValeursNulles=false",
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + process.env.INSEE_API_TOKEN
      }
    }
  )
    .then(async res => {
      /*if (!res.ok) {
      throw new ApolloError("Can't find a comapny associated with this siren");
    }*/
      return await res.json();
    })
    .catch(err => console.log(err));
  if (json === null) throw new ApolloError("InseeApiError");
  json.etablissements.sort((first: any, second: any) => {
    return parseInt(second.nic) - parseInt(first.nic);
  });
  const activityCode =
    json.etablissements[0].uniteLegale.activitePrincipaleUniteLegale;
  /*if (!activityCode.startsWith("01"))
    throw new ApolloError("Company don't have a producer activity.", "400");*/
  return json.etablissements[0];
};

export default {
  Query: {
    getAllCompanies: async (
      _: any,
      { page, pageSize }: { page: number; pageSize: number }
    ): Promise<CompanyModel[]> => {
      return CompanyModel.findAll({
        include: [
          { model: CompanyImageModel, as: "logo" },
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
          },
          {
            model: CompanyDeliveryDayModel,
            include: [CompanyDeliveryDayHoursModel]
          }
        ],
        offset: page && pageSize ? page * pageSize : 0,
        limit: pageSize ? pageSize : 0
      });
    },
    getCompany: async (
      _: any,
      { companyId }: { companyId: string }
    ): Promise<CompanyModel | null> => {
      const company = await CompanyModel.findByPk(companyId, {
        include: [
          {
            model: CompanyImageModel,
            as: "logo"
          },
          {
            model: CompanyImageModel,
            as: "cover"
          },
          CompanyTagModel,
          {
            model: CompanyUserModel,
            include: [RoleModel, UserModel]
          },
          {
            model: CompanyOpeningDayModel,
            include: [CompanyOpeningDayHoursModel]
          },
          {
            model: CompanyDeliveryDayModel,
            include: [CompanyDeliveryDayHoursModel]
          }
        ]
      });
      if (!company) throw new ApolloError("CompanyNotFound", "404");
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
    getCompaniesByDistanceByCustomer: combineResolvers(
      isUserAndCustomer,
      async (
        _: any,
        {
          page,
          pageSize
        }: { page: number; pageSize: number; lat: number; lon: number },
        { user: { customer } }: Context
      ): Promise<CompanyModel[]> => {
        const customerFetched = await CustomerModel.findByPk(customer.id, {
          include: [{ model: CustomerAddressModel, as: "activeAddress" }]
        });
        if (!customerFetched) {
          throw new ApolloError("CustomerNotFound");
        }
        const location: Literal = Sequelize.literal(
          `ST_GeomFromText('POINT(${customerFetched.activeAddress.location.coordinates[0]} ${customerFetched.activeAddress.location.coordinates[1]})')`
        );
        const distance: Fn = Sequelize.fn(
          "ST_DistanceSphere",
          Sequelize.col("geoPosition"),
          location
        );

        return CompanyModel.findAll({
          attributes: { include: [[distance, "distance"]] },
          include: toIncludeWhenGetCompany,
          order: Sequelize.literal("distance ASC"),
          offset: page,
          limit: pageSize
        });
      }
    ),
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
        Sequelize.col("geoPosition"),
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
            include: [
              {
                model: CompanyModel,
                include: [
                  { model: CompanyImageModel, as: "logo" },
                  { model: CompanyImageModel, as: "cover" }
                ]
              }
            ]
          }
        ]
      });
      if (userFetched) {
        return userFetched.companies.map(companyInfo => {
          return companyInfo.company;
        });
      }
      throw new ApolloError("UserNotFound");
    },
    getCompaniesByUser: async (
      _: any,
      { userId }: { userId: string }
    ): Promise<CompanyUserModel[] | undefined> => {
      return CompanyUserModel.findAll({
        where: { userId: userId },
        include: [
          {
            model: CompanyModel,
            include: [
              {
                model: CompanyImageModel,
                as: "logo"
              },
              {
                model: CompanyImageModel,
                as: "cover"
              }
            ]
          }
        ]
      });
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
          [Op.or]: [
            { name: { [Op.iLike]: "%" + query + "%" } }
            // { 'name': { [Op.iLike]: "%" + query + "%" } },
            // { "$CompanyTags.slugName$": { [Op.iLike]: "%" + query + "%" } }
            // { "$CompanyTagModel.slugName$": query }
          ]
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
          CompanyProductsCategoryModel,
          CompanyTagModel
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
    ): Promise<CompanyImageModel[]> => {
      return CompanyImageModel.findAll({
        where: { companyId },
        limit: pageSize,
        offset: page * pageSize
      });
    },
    checkSiren: combineResolvers(
      isAuthenticated,
      pipeResolvers(
        isValidSiren,
        (root: any, args: any): Promise<any | null> => {
          return root;
        }
      )
    )
  },
  Mutation: {
    createCompany: combineResolvers(
      isAuthenticated,
      pipeResolvers(
        isValidSiren,
        async (
          root: any,
          args: CreateCompanyProps,
          { user }: Context
        ): Promise<CompanyModel> => {
          //TODO Check if user is null for every function that use the user as context
          let point: Point = {
            type: "",
            coordinates: []
          };
          const geocoder: Geocoder = NodeGeocoder({
            provider: "openstreetmap"
          });
          await geocoder.geocode(args.address, function(err, res) {
            if (err) throw new ApolloError("OSMError", "500");
            //If coordinates are not found, avoid server crash
            if (res.length == 0) {
              return;
            }
            point = {
              type: "Point",
              coordinates: [
                parseFloat(String(res[0].longitude)),
                parseFloat(String(res[0].latitude))
              ]
            };
          });
          if (point.coordinates.length == 0) {
            throw new ApolloError("AddressNotFound", "400");
          }
          const ownerRole: RoleModel | null = await RoleModel.findOne({
            where: { slugName: "owner" }
          }).then(elem => elem);
          if (ownerRole == null) throw new ApolloError("NoOwnerRole", "500");
          if (!root) {
            new ApolloError("WrongSiren");
          }
          /*args.name =
            root.uniteLegale.periodesUniteLegale[0].denominationUniteLegale;
          args.officialName =
            root.uniteLegale.periodesUniteLegale[0].denominationUniteLegale;*/
          const newCompany: CompanyModel = await CompanyModel.create({
            ...args,
            geoPosition: point
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
        }
      )
    ),
    deleteCompany: combineResolvers(
      isAuthenticated,
      async (_: any, { companyId }, { user }: Context) => {
        const [nb, company] = await CompanyModel.update(
          { archivedAt: Date.now() },
          {
            where: { id: companyId },
            returning: true
          }
        );
        if (nb == 0) {
          throw new ApolloError("CompanyNotFound");
        }
        return company[0];
      }
    ),
    updateCompany: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        {
          companyId,
          newValues
        }: { companyId: string; newValues: CreateCompanyProps }
      ): Promise<CompanyModel | null> => {
        const [nb] = await CompanyModel.update(newValues, {
          where: { id: companyId }
        });
        if (nb === 0) {
          throw new ApolloError("CompanyNotFound", "500");
        }
        return CompanyModel.findByPk(companyId, {
          include: [
            {
              model: CompanyImageModel,
              as: "logo"
            },
            {
              model: CompanyImageModel,
              as: "cover"
            }
          ]
        });
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
        if (!company) throw new ApolloError("CompanyNotFound", "404");
        const companyUser = await CompanyUserModel.findOne({
          where: {
            companyId,
            userId
          }
        });
        if (companyUser !== null)
          throw new ApolloError(
            "AlreadyPartOfCompany", // TODO : translate
            "403"
          );
        const userRole: RoleModel | null = await RoleModel.findOne({
          where: { slugName: "member" }
        });
        if (userRole == null) {
          throw new ApolloError("RoleNotFound", "500"); // TODO : translate
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
        { companyId, userId }: { companyId: string; userId: string }
      ): Promise<CompanyModel | null> => {
        const company: CompanyModel | null = await CompanyModel.findOne({
          where: { id: companyId }
        });
        if (!company)
          throw new ApolloError(
            "CompanyNotFound", // TODO : translate
            "404"
          );
        const companyUser: CompanyUserModel | null = await CompanyUserModel.findOne(
          { where: { companyId: companyId, userId: userId } }
        );
        if (companyUser === null) {
          throw new ApolloError("NotPartOfCompany", "400");
        }
        CompanyUserRoleModel.destroy({
          where: { companyUserId: companyUser.id }
        });
        companyUser.destroy();
        return CompanyModel.findByPk(companyId);
      }
    ),
    restoreCompany: combineResolvers(
      isAuthenticated,
      async (_: any, { companyId }, { user }: Context) => {
        const [nb, company] = await CompanyModel.update(
          { archivedAt: null },
          {
            where: { id: companyId },
            returning: true
          }
        );
        if (nb == 0) {
          throw new ApolloError("CompanyNotFound");
        }
        return company[0];
      }
    )
  }
};