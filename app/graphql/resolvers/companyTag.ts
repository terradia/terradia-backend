import CompanyTagModel from "../../database/models/company-tag.model";
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated } from "./authorization";
import { ApolloError } from "apollo-server";
import CompanyTagRelationsModel from "../../database/models/company-tag-relations.model";
import CompanyModel from "../../database/models/company.model";
import { WhereOptions } from "sequelize";

export default {
  Query: {
    getAllCompanyTags: combineResolvers(
      isAuthenticated,
      async (): Promise<CompanyTagModel[]> => {
        return CompanyTagModel.findAll();
      }
    ),
    getCompanyTag: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        { companyTagId, slugName }: { companyTagId?: string; slugName?: string }
      ): Promise<CompanyTagModel | null> => {
        if (!companyTagId && !slugName) {
          throw new ApolloError("NoFilter", "400");
        } else {
          const where: WhereOptions = companyTagId
            ? { id: companyTagId }
            : { slugName };
          return CompanyTagModel.findOne({
            where
          });
        }
      }
    )
  },
  Mutation: {
    createCompanyTag: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        _args: { name: string; color: string }
      ): Promise<CompanyTagModel> => {
        return CompanyTagModel.create({
          slugName: _args.name,
          translationKey: _args.name + ".label",
          color: _args.color
        });
      }
    ),
    deleteCompanyTag: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        { companyTagId }: { companyTagId: string }
      ): Promise<CompanyTagModel> => {p
        const tag = await CompanyTagModel.findOne({
          where: { id: companyTagId }
        });
        if (!tag) throw new ApolloError("TagNotFound", "404");
        await CompanyTagModel.destroy({ where: { id: companyTagId } });
        await CompanyTagRelationsModel.destroy({
          where: { tagId: companyTagId }
        });
        return tag;
      }
    ),
    addTagToCompany: combineResolvers(
      isAuthenticated,
      async (
        _parent: any,
        { companyTagId, companyId }: { companyTagId: string; companyId: string }
      ): Promise<CompanyModel | null> => {
        const tag = await CompanyTagModel.findOne({
          where: { id: companyTagId }
        });
        if (!tag) throw new ApolloError("TagNotFound", "404");
        const company = await CompanyModel.findOne({
          where: { id: companyId }
        });
        if (!company)
          throw new ApolloError("CompanyNotFound", "404");

        await CompanyTagRelationsModel.findOrCreate({
          where: { tagId: companyTagId, companyId }
        });
        return CompanyModel.findOne({
          where: { id: companyId },
          include: [CompanyTagModel]
        });
      }
    ),
    deleteTagFromCompany: combineResolvers(
      isAuthenticated,
      async (
        _parent: any,
        { companyTagId, companyId }: { companyTagId: string; companyId: string }
      ): Promise<CompanyModel | null> => {
        const tag = await CompanyTagModel.findOne({
          where: { id: companyTagId }
        });
        if (!tag) throw new ApolloError("TagNotFound", "404");
        const company = CompanyModel.findOne({ where: { id: companyId } });
        if (!company)
          throw new ApolloError("CompanyNotFound", "404");

        const result: number = await CompanyTagRelationsModel.destroy({
          where: {
            companyId,
            tagId: companyTagId
          }
        });
        if (result === 0)
          throw new ApolloError(
            "TagNotLinked",
            "404"
          );
        return CompanyModel.findOne({
          where: { id: companyId },
          include: [CompanyTagModel]
        });
      }
    )
  }
};
