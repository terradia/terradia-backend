import CompanyImagesModel from "../../database/models/company-images.model";
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated } from "./authorization";
import UserModel from "../../database/models/user.model";
import { uploadToS3AsCompany } from "../../uploadS3";

declare interface Context {
  user: UserModel;
}

declare interface CompanyImagesData {
  stream: Body;
  filename: string;
  mimetype: string;
  encoding: string;
}

export default {
  Query: {
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
    addCompanyImages: combineResolvers(
      isAuthenticated,
      (
        _: any,
        {
          images,
          companyId
        }: { images: CompanyImagesData[]; companyId: string },
        { user }: Context
      ): Promise<CompanyImagesModel>[] => {
        return images.map(async image => {
          const { stream, filename } = image;
          const imageCreated = await uploadToS3AsCompany(
            filename,
            stream,
            companyId,
            null
          );
          return imageCreated.image;
        });
      }
    ),
    removeCompanyImages: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        { imagesId }: { imagesId: string[] },
        { user }: Context
      ): Promise<CompanyImagesModel[] | null> => {
        const images = await CompanyImagesModel.findAll({
          where: { id: imagesId }
        });
        await CompanyImagesModel.destroy({
          where: { id: imagesId }
        });
        return images;
      }
    )
  }
};
