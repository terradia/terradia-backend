import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated } from "./authorization";
import CompanyDeliveryDayModel from "../../database/models/company-delivery-day.model";
import CompanyModel from "../../database/models/company.model";
import { ApolloError } from "apollo-server-errors";
import CompanyDeliveryDayHoursModel from "../../database/models/company-delivery-day-hours.model";

export default {
  Mutation: {
    addDeliveryDay: combineResolvers(
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
      ): Promise<CompanyDeliveryDayModel | null> => {
        const company: CompanyModel | null = await CompanyModel.findOne({
          where: { id: companyId }
        });
        if (!company)
          throw new ApolloError(
            "CompanyNotFound", // TODO : translate
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
          throw new ApolloError("InvalidDay", "400");
        const result: [
          CompanyDeliveryDayModel,
          boolean
        ] = await CompanyDeliveryDayModel.findOrCreate({
          where: {
            dayTranslationKey: day + ".label",
            daySlugName: day,
            companyId
          }
        });
        const companyDeliveryDay: CompanyDeliveryDayModel = result[0];
        if (hours !== undefined) {
          // get hours of the corresponding day
          const oldHours: CompanyDeliveryDayHoursModel[] = await CompanyDeliveryDayHoursModel.findAll(
            {
              where: { dayId: companyDeliveryDay.id }
            }
          );
          for (let i = 0; i < oldHours.length || i < hours.length; i++) {
            const oldHour = oldHours.length > i ? oldHours[i] : null;
            const hour = hours.length > i ? hours[i] : null;
            if (hour !== null) {
              const defaults: any = {
                startTime: hour.startTime,
                endTime: hour.endTime,
                dayId: companyDeliveryDay.id
              };
              if (oldHour === null) {
                await CompanyDeliveryDayHoursModel.create(defaults);
              } else {
                await CompanyDeliveryDayHoursModel.findOrCreate({
                  where: { id: oldHour.id },
                  defaults
                });
              }
            } else if (oldHour !== null) {
              // if there is less hours specifications than before, remove the
              // ones that in the db but should not exists.
              await CompanyDeliveryDayHoursModel.destroy({
                where: { id: oldHour.id }
              });
            }
          }
        }
        return CompanyDeliveryDayModel.findOne({
          where: { id: companyDeliveryDay.id },
          include: [CompanyDeliveryDayHoursModel]
        });
      }
    ),
    updateDeliveryDay: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        {
          DeliveryDayId,
          hours
        }: {
          DeliveryDayId: string;
          hours?: { startTime: Date; endTime: Date }[];
        }
      ): Promise<CompanyDeliveryDayModel | null> => {
        const result: [
          CompanyDeliveryDayModel,
          boolean
        ] = await CompanyDeliveryDayModel.findOrCreate({
          where: {
            id: DeliveryDayId
          }
        });
        const companyDeliveryDay: CompanyDeliveryDayModel = result[0];
        if (hours !== undefined) {
          // remove all the hours from before
          await CompanyDeliveryDayHoursModel.destroy({
            where: { dayId: companyDeliveryDay.id }
          });
          for (const hour of hours) {
            await CompanyDeliveryDayHoursModel.create({
              startTime: new Date(hour.startTime),
              endTime: new Date(hour.endTime),
              dayId: companyDeliveryDay.id
            });
          }
        }
        return CompanyDeliveryDayModel.findOne({
          where: { id: companyDeliveryDay.id },
          include: [CompanyDeliveryDayHoursModel]
        });
      }
    ),
    removeDeliveryDay: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        {
          DeliveryDayId
        }: {
          DeliveryDayId: string;
        }
      ): Promise<CompanyDeliveryDayModel | null> => {
        const companyDeliveryDay: CompanyDeliveryDayModel | null = await CompanyDeliveryDayModel.findOne(
          {
            where: {
              id: DeliveryDayId
            }
          }
        );
        if (!companyDeliveryDay)
          throw new ApolloError("DeliveryDayNotFound", "404");
        await CompanyDeliveryDayModel.destroy({
          where: { id: DeliveryDayId }
        });
        return companyDeliveryDay;
      }
    ),
    updateDeliveryHours: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        {
          hourId,
          hours
        }: { hourId: string; hours: { startTime: Date; endTime: Date } }
      ): Promise<CompanyDeliveryDayHoursModel | null> => {
        const tmp: [
          number,
          CompanyDeliveryDayHoursModel[]
        ] = await CompanyDeliveryDayHoursModel.update(
          { ...hours },
          { where: { id: hourId } }
        );
        if (tmp[0] === 0)
          throw new ApolloError("UpdateError", "404");
        const h: CompanyDeliveryDayHoursModel | null = await CompanyDeliveryDayHoursModel.findOne(
          { where: { id: hourId }, include: [CompanyDeliveryDayModel] }
        );
        if (!h) throw new ApolloError("HourNotFound", "404");
        return h;
      }
    ),
    removeDeliveryHours: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        { hourId }: { hourId: string }
      ): Promise<CompanyDeliveryDayHoursModel | null> => {
        const h: CompanyDeliveryDayHoursModel | null = await CompanyDeliveryDayHoursModel.findOne(
          { where: { id: hourId }, include: [CompanyDeliveryDayModel] }
        );
        if (!h) throw new ApolloError("DeliveryHourNotFound", "404");
        await CompanyDeliveryDayHoursModel.destroy({
          where: { id: hourId }
        });
        return h;
      }
    )
  }
};
