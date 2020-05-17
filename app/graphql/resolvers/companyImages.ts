import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated } from "./authorization";
import UserModel from "../../database/models/user.model";
import { uploadToS3AsCompany } from "../../uploadS3";
import ProductCompanyImageModel from "../../database/models/product-company-images.model";
import { ApolloError } from "apollo-server-errors";
import CompanyImageModel from "../../database/models/company-image.model";
import ProductModel from "../../database/models/product.model";

declare interface Context {
  user: UserModel;
}

export declare interface CompanyImageData {
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
    ): Promise<CompanyImageModel[]> => {
      return CompanyImageModel.findAll({
        where: { companyId },
        limit: pageSize,
        offset: page * pageSize,
        include: [ProductModel]
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
          companyId,
          names
        }: { images: CompanyImageData[]; companyId: string; names?: string[] }
      ): Promise<CompanyImageModel>[] => {
        return images.map(async (image, index) => {
          const { stream, filename } = await image;
          const imageCreated = await uploadToS3AsCompany(
            filename,
            stream,
            companyId,
            null,
            names ? names[index] : undefined
          );
          return imageCreated.image;
        });
      }
    ),
    addCompanyImage: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        {
          image,
          companyId,
          name
        }: { image: CompanyImageData; companyId: string; name?: string }
      ): Promise<CompanyImageModel> => {
        const { stream, filename } = await image;
        const imageCreated = await uploadToS3AsCompany(
          filename,
          stream,
          companyId,
          null,
          name
        );
        return imageCreated.image;
      }
    ),
    removeCompanyImages: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        { imagesId }: { imagesId: string[] }
      ): Promise<CompanyImageModel[] | null> => {
        const images = await CompanyImageModel.findAll({
          where: { id: imagesId }
        });
        await CompanyImageModel.destroy({
          where: { id: imagesId }
        });
        // TODO : remove the image from AmazonS3
        // destroy all of the items in the joinTable
        await ProductCompanyImageModel.destroy({
          where: { companyImageId: imagesId }
        });
        return images;
      }
    ),
    removeCompanyImage: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        { imageId }: { imageId: string }
      ): Promise<CompanyImageModel | null> => {
        const image = await CompanyImageModel.findOne({
          where: { id: imageId }
        });
        await CompanyImageModel.destroy({
          where: { id: imageId }
        });
        // TODO : remove the image from AmazonS3
        // destroy all of the items in the joinTable
        await ProductCompanyImageModel.destroy({
          where: { companyImageId: imageId }
        });
        return image;
      }
    ),
    updateCompanyImageName: combineResolvers(
      isAuthenticated,
      async (
        _: any,
        { imageId, name }: { imageId: string; name: string }
      ): Promise<CompanyImageModel> => {
        const img: CompanyImageModel | null = await CompanyImageModel.findOne({
          where: { id: imageId }
        });
        if (!img) throw new ApolloError("Image not found", "404");
        const result: [
          number,
          CompanyImageModel[]
        ] = await CompanyImageModel.update(
          { name },
          { where: { id: imageId }, returning: true }
        );
        return result[1][0];
      }
    )
  }
};
