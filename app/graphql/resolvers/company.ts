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
import { combineResolvers, pipeResolvers, skip } from "graphql-resolvers";
import { isAuthenticated, isUserAndCustomer } from "./authorization";
import CompanyImageModel from "../../database/models/company-image.model";
import CompanyOpeningDayModel from "../../database/models/company-opening-day.model";
import CompanyOpeningDayHoursModel from "../../database/models/company-opening-day-hours.model";
import CompanyTagModel from "../../database/models/company-tag.model";
import CustomerAddressModel from "../../database/models/customer-address.model";
import CustomerModel from "../../database/models/customer.model";
import CompanyDeliveryDayModel from "../../database/models/company-delivery-day.model";
import CompanyDeliveryDayHoursModel from "../../database/models/company-delivery-day-hours.model";
import {
  archivedCompanieEmail,
  restoreCompanieEmail
} from "../../services/mails/companies";
import client from "../../database/elastic/server";

import Stripe from "stripe";
import company from "../schema/company";
const stripe = new Stripe(process.env.STRIPE_API_KEY || "", {
  apiVersion: "2020-03-02"
});

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
  tokenAccount: string;
}

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
  const company = await CompanyModel.findOne({
    where: { siren: siren }
  });
  if (company) {
    throw new ApolloError("CompanyAlreadyExist");
  }
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
      return await res.json();
    })
    .catch(err => console.log(err));
  if (json === null || json === undefined)
    throw new ApolloError("Error while getting information from the INSEE API");
  if (json.header.statut == 404) {
    throw new ApolloError("Can not find company with siren: " + siren, "500");
  }
  json.etablissements.sort((first: any, second: any) => {
    return parseInt(second.nic) - parseInt(first.nic);
  });
  /*const activityCode =
    json.etablissements[0].uniteLegale.activitePrincipaleUniteLegale;
  if (!activityCode.startsWith("01"))
    throw new ApolloError("Company don't have a producer activity.", "400");*/
  return json.etablissements[0];
};

interface GeocoderQuery {
  street: string;
  city: string;
  county: string;
  state: string;
  country: string;
  postalcode: string;
  [x: string]: string;
}

const checkGeocode = async (
  root: any,
  { address }: { address: string }
): Promise<NodeGeocoder.Entry[]> => {
  const geocoder: Geocoder = NodeGeocoder({
    provider: "openstreetmap"
  });
  return await geocoder.geocode(address).then(res => {
    if (res.length === 0) {
      throw new ApolloError("No location found using provided address", "500");
    }
    const ret = res.filter(value => {
      return value.streetNumber;
    });
    return ret || res;
  });
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
        offset: page * pageSize,
        limit: pageSize
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
      if (!company) throw new ApolloError("This company does not exist", "404");
      return company;
    },
    getCompanyAndDistance: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        { companyId }: { companyId: string },
        { user: { customer } }: Context
      ): Promise<CompanyModel | null> => {
        const customerFetched = await CustomerModel.findByPk(customer.id, {
          include: [{ model: CustomerAddressModel, as: "activeAddress" }]
        });
        if (!customerFetched) {
          throw new ApolloError("Customer doesn't exist");
        }
        const location: Literal = Sequelize.literal(
          `ST_GeomFromText('POINT(${customerFetched.activeAddress.location.coordinates[0]} ${customerFetched.activeAddress.location.coordinates[1]})')`
        );
        const distance: Fn = Sequelize.fn(
          "ST_DistanceSphere",
          Sequelize.col("geoPosition"),
          location
        );
        const company = await CompanyModel.findByPk(companyId, {
          attributes: { include: [[distance, "distance"]] },
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
        if (!company)
          throw new ApolloError("This company does not exist", "404");
        return company;
      }
    ),
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
          throw new ApolloError("Customer doesn't exist");
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
          include: [
            CompanyTagModel,
            { model: CompanyImageModel, as: "logo" },
            { model: CompanyImageModel, as: "cover" }
          ],
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
      throw new ApolloError("User not found");
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
        //https://stackoverflow.com/questions/31258158/how-to-implement-search-feature-using-sequelizejs/37326395
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: "%" + query + "%" } },
            // { 'name': { [Op.iLike]: "%" + query + "%" } },
            // { "$CompanyTags.slugName$": { [Op.iLike]: "%" + query + "%" } }
            { "$tags.slugName$": { [Op.iLike]: "%" + query + "%" } },
            { "$products.name$": { [Op.iLike]: "%" + query + "%" } },
            { "$products.description$": { [Op.iLike]: "%" + query + "%" } }
            // { "tags.slugName$": query }
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
    ),
    geocode: combineResolvers(
      isAuthenticated,
      pipeResolvers(
        checkGeocode,
        (
          root: any,
          args: { address: string; query?: NodeGeocoder.Query }
        ): Promise<NodeGeocoder.Entry[] | null> => {
          return root;
        }
      )
    ),
    getCompanyStripeAccount: async (
      _: any,
      { companyId }: { companyId: string },
      __: any
    ): Promise<any> => {
      const company = await CompanyModel.findByPk(companyId);
      if (!company) throw new ApolloError("Company not found");
      const account = await stripe.accounts.retrieve(company.stripeAccount);
      return account;
    }
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
          const tokenAccount = args.tokenAccount;
          delete args.tokenAccount;
          console.log(root);
          const ownerRole: RoleModel | null = await RoleModel.findOne({
            where: { slugName: "owner" }
          }).then(elem => elem);
          console.log(ownerRole);
          if (ownerRole == null)
            throw new ApolloError(
              "There is no owner Role in the DB, cannot create Company. Try to seed the DB.",
              "500"
            );
          if (!root) {
            new ApolloError("can not find company in the insee api");
          }
          const geo = await checkGeocode(null, { address: args.address });
          console.log(geo);
          const newCompany: CompanyModel = await CompanyModel.create({
            ...args,
            numberOrders: 0,
            numberOrderHistories: 0,
            geoPosition: {
              type: "Point",
              coordinates: [
                parseFloat(String(geo.longitude)),
                parseFloat(String(geo.latitude))
              ]
            }
          });
          // await client.index({
          //   index: "companies",
          //   id: newCompany.id,
          //   body: {
          //     name: newCompany.name,
          //     address: newCompany.address,
          //     products: []
          //   }
          // });

          try {
            // @ts-ignore
            const account = await stripe.accounts.create({
              country: "FR",
              type: "custom",
              account_token: tokenAccount,
              business_profile: { url: "https://producteurs.terradia.eu" },
              capabilities: {
                transfers: { requested: true }
              }
            });
            await CompanyModel.update(
              {
                stripeAccount: account.id
              },
              {
                where: {
                  id: newCompany.id
                }
              }
            );
          } catch (e) {
            console.error(e);
          }

          await CompanyUserModel.create({
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
          throw new ApolloError("Can't find the requested company");
        } else {
          archivedCompanieEmail(
            company[0].email,
            company[0].name,
            user.firstName
          );
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
          throw new ApolloError("Can't find the requested company", "500");
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
          throw new ApolloError("Can't find the requested company");
        } else {
          restoreCompanieEmail(
            company[0].email,
            company[0].name,
            user.firstName,
            user.lastName
          );
        }
        return company[0];
      }
    ),
    updateCompanyExternalAccount: combineResolvers(
      isAuthenticated,
      async (_: any, { token, companyId }, { user }: Context) => {
        const company = await CompanyModel.findByPk(companyId);
        if (!company) throw new ApolloError("Can't find the requested company");
        try {
          const account = await stripe.accounts.update(company?.stripeAccount, {
            external_account: token
          });
          return true;
        } catch (e) {
          throw new ApolloError(e);
        }
      }
    )
  }
};
