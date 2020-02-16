import ProductModel from "../../database/models/product.model";
import CompanyModel from "../../database/models/company.model";
import CompanyReviewModel from "../../database/models/company-review.model";
import CompanyProductsCategoryModel from "../../database/models/company-products-category.model";
// @ts-ignore
import sequelize from "../../database/models";
import NodeGeocoder from "node-geocoder";
import { ApolloError } from "apollo-server-errors";
import UserModel from "../../database/models/user.model";

export default {
  Query: {
    getAllCompanies: async (
      _parent: any,
      { page, pageSize }: { page: number; pageSize: number }
    ) => {
      return CompanyModel.findAll({
        include: [
          ProductModel,
          UserModel,
          CompanyReviewModel,
          CompanyProductsCategoryModel
        ],
        offset: page,
        limit: pageSize
      });
    },
    getCompany: async (_parent: any, { companyId }: { companyId: string }) => {
      return CompanyModel.findOne({
        where: { id: companyId },
        include: [
          ProductModel,
          UserModel,
          CompanyReviewModel,
          CompanyProductsCategoryModel
        ]
      });
    },
    getCompanyByName: async (_parent, { name }: { name: string }) => {
      return CompanyModel.findOne({
        where: { name },
        include: [
          ProductModel,
          UserModel,
          CompanyReviewModel,
          CompanyProductsCategoryModel
        ]
      });
    },
    getCompaniesByDistance: async (
      _parent: any,
      {
        page,
        pageSize,
        lat,
        lon
      }: { page: number; pageSize: number; lat: number; lon: number }
    ) => {
      const location = sequelize.literal(
        `ST_GeomFromText('POINT(${lat} ${lon})')`
      );
      const distance = sequelize.fn(
        "ST_DistanceSphere",
          sequelize.col("position"),
          location,
      );

      const companies = await CompanyModel.findAll({
        attributes: { include: [[distance, "distance"]] },
        include: [
          ProductModel,
          UserModel,
          CompanyReviewModel,
          CompanyProductsCategoryModel
        ],
        order: distance,
        offset: page,
        limit: pageSize
      });
      return companies.map((element) => {
        return element.toJSON();
      });
    }
  },
  Mutation: {
    createCompany: async (
      _parent,
      _args: {
        name: string;
        description: string;
        email: string;
        phone: string;
        address: string;
      }
    ) => {
      let point = undefined;
      let geocoder = NodeGeocoder({ provider: "openstreetmap" });
      await geocoder.geocode(_args.address, function(err, res) {
        if (err)
          throw new ApolloError("Error while get geo data from address", "500");
        point = {
          type: "Point",
          coordinates: [
            parseFloat(res[0].longitude),
            parseFloat(res[0].latitude)
          ]
        };
      });
      const newCompany = await CompanyModel.create({
        ..._args,
        position: point
      }).then(company => {
        return company;
      });
      return newCompany.toJSON();
    }
  }
};
