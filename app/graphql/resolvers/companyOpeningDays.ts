import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated } from "./authorization";
import CompanyOpeningDayModel from "../../database/models/company-opening-day.model";
import CompanyModel from "../../database/models/company.model";
import { ApolloError } from "apollo-server-errors";
import CompanyOpeningDayHoursModel from "../../database/models/company-opening-day-hours.model";

export default {
  Mutation: {
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
