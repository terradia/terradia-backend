import ProductModel from "../../database/models/product.model";
import UserModel from "../../database/models/user.model";
import CompanyModel from "../../database/models/company.model";
import CompanyReviewModel from "../../database/models/company-review.model";
import CompanyProductsCategoryModel from "../../database/models/company-products-category.model";
import CompanyUserModel from "../../database/models/company-user.model";
import RoleModel from "../../database/models/role.model";
import NodeGeocoder, { Geocoder } from "node-geocoder";
import { ApolloError } from "apollo-server-errors";
import { Sequelize } from "sequelize";
import { Fn, Literal } from "sequelize/types/lib/utils";
import CompanyUserRoleModel from "../../database/models/company-user-role.model";
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated } from "./authorization";
import CompanyOpeningDayModel from "../../database/models/company-opening-day.model";
import CompanyOpeningDayHoursModel from "../../database/models/company-opening-day-hours.model";

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
}

export default {
  Query: {
    getAllCompanies: async (
      _: any,
      { page, pageSize }: { page: number; pageSize: number }
    ): Promise<CompanyModel[]> => {
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
          },
          {
            model: CompanyOpeningDayModel,
            include: [CompanyOpeningDayHoursModel]
          }
        ],
        offset: page,
        limit: pageSize
      });
    },
    getCompany: async (
      _: any,
      { companyId }: { companyId: string }
    ): Promise<CompanyModel | null> => {
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
          },
          {
            model: CompanyOpeningDayModel,
            include: [CompanyOpeningDayHoursModel]
          }
        ]
      });
    },
    getCompanyByName: async (
      _: any,
      { name }: { name: string }
    ): Promise<CompanyModel | null> => {
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
    ),
    addOpeningDay: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        {
          companyId,
          day,
          hours
        }: {
          companyId: string;
          day: string;
          hours?: { startTime: Date; endTime: Date }[];
        }
      ): Promise<CompanyOpeningDayModel | null> => {
        const company: CompanyModel | null = await CompanyModel.findOne({
          where: { id: companyId }
        });
        if (!company)
          throw new ApolloError(
            "The company does not exists", // TODO : translate
            "404"
          );
        const days: string[] = [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday"
        ];
        if (days.findIndex(d => d === day) === -1)
          throw new ApolloError(
            "The day is invalid. It should be : 'monday', 'tuesday', 'wednesday', 'thursday', 'saturday', 'sunday'",
            "400"
          );
        const result: [
          CompanyOpeningDayModel,
          boolean
        ] = await CompanyOpeningDayModel.findOrCreate({
          where: {
            dayTranslationKey: day + ".label",
            daySlugName: day,
            companyId
          }
        });
        const companyOpeningDay: CompanyOpeningDayModel = result[0];
        if (hours !== undefined) {
          // get hours of the corresponding day
          const oldHours: CompanyOpeningDayHoursModel[] = await CompanyOpeningDayHoursModel.findAll(
            {
              where: { dayId: companyOpeningDay.id }
            }
          );
          for (let i = 0; i < oldHours.length || i < hours.length; i++) {
            const oldHour = oldHours.length > i ? oldHours[i] : null;
            const hour = hours.length > i ? hours[i] : null;
            if (hour !== null) {
              const defaults: any = {
                startTime: hour.startTime,
                endTime: hour.endTime,
                dayId: companyOpeningDay.id
              };
              if (oldHour === null) {
                await CompanyOpeningDayHoursModel.create(defaults);
              } else {
                await CompanyOpeningDayHoursModel.findOrCreate({
                  where: { id: oldHour.id },
                  defaults
                });
              }
            } else if (oldHour !== null) {
              // if there is less hours specifications than before, remove the
              // ones that in the db but should not exists.
              await CompanyOpeningDayHoursModel.destroy({
                where: { id: oldHour.id }
              });
            }
          }
        }
        return CompanyOpeningDayModel.findOne({
          where: { id: companyOpeningDay.id },
          include: [CompanyOpeningDayHoursModel]
        });
      }
    ),
    updateOpeningDay: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        {
          openingDayId,
          hours
        }: {
          openingDayId: string;
          hours?: { startTime: Date; endTime: Date }[];
        }
      ): Promise<CompanyOpeningDayModel | null> => {
        const result: [
          CompanyOpeningDayModel,
          boolean
        ] = await CompanyOpeningDayModel.findOrCreate({
          where: {
            id: openingDayId
          }
        });
        const companyOpeningDay: CompanyOpeningDayModel = result[0];
        if (hours !== undefined) {
          // remove all the hours from before
          await CompanyOpeningDayHoursModel.destroy({
            where: { dayId: companyOpeningDay.id }
          });
          for (const hour of hours) {
            await CompanyOpeningDayHoursModel.create({
              startTime: new Date(hour.startTime),
              endTime: new Date(hour.endTime),
              dayId: companyOpeningDay.id
            });
          }
        }
        return CompanyOpeningDayModel.findOne({
          where: { id: companyOpeningDay.id },
          include: [CompanyOpeningDayHoursModel]
        });
      }
    ),
    removeOpeningDay: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        {
          openingDayId
        }: {
          openingDayId: string;
        }
      ): Promise<CompanyOpeningDayModel | null> => {
        const companyOpeningDay: CompanyOpeningDayModel | null = await CompanyOpeningDayModel.findOne(
          {
            where: {
              id: openingDayId
            }
          }
        );
        if (!companyOpeningDay)
          throw new ApolloError("Cannot find this resource", "404");
        await CompanyOpeningDayModel.destroy({
          where: { id: openingDayId }
        });
        return companyOpeningDay;
      }
    ),
    updateOpeningHours: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        {
          hourId,
          hours
        }: { hourId: string; hours: { startTime: Date; endTime: Date } }
      ): Promise<CompanyOpeningDayHoursModel | null> => {
        const tmp: [
          number,
          CompanyOpeningDayHoursModel[]
        ] = await CompanyOpeningDayHoursModel.update(
          { ...hours },
          { where: { id: hourId } }
        );
        if (tmp[0] === 0)
          throw new ApolloError("Could not update the resource", "404");
        const h: CompanyOpeningDayHoursModel | null = await CompanyOpeningDayHoursModel.findOne(
          { where: { id: hourId }, include: [CompanyOpeningDayModel] }
        );
        if (!h) throw new ApolloError("This hours does not exist", "404");
        return h;
      }
    ),
    removeOpeningHours: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        { hourId }: { hourId: string }
      ): Promise<CompanyOpeningDayHoursModel | null> => {
        const h: CompanyOpeningDayHoursModel | null = await CompanyOpeningDayHoursModel.findOne(
          { where: { id: hourId }, include: [CompanyOpeningDayModel] }
        );
        if (!h) throw new ApolloError("Cannot find this resource", "404");
        await CompanyOpeningDayHoursModel.destroy({
          where: { id: hourId }
        });
        return h;
      }
    )
  }
};
