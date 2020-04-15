import TagModel from "../../database/models/tag-company-category.model";
import CompanyModel from "../../database/models/company.model";
import TagCompanyModel from "../../database/models/tag-company.model";

interface addTagToCompanyArgs {
  companyId: string;
  tagName: string;
}
export default {
  Query: {
    getAllTagCompany: async () => {
      return TagModel
        .findAll
        //   {
        //   include: [CompanyModel]
        // }
        ();
    },
    getTagCompanyByName: async (_parent: any, { name }: { name: string }) => {
      return TagModel.findOne({
        where: { name }
        // ,
        // include: [CompanyModel]
      });
    }
  },
  Mutation: {
    createTagCompany: async (_parent: any, _args: { name: string }) => {
      let tag = await TagModel.create(_args);
      if (tag) return tag.toJSON();
      else {
        throw Error("The tag company is null");
      }
    },
    deleteTagCompany: async (_parent: any, { id }: { id: string }) => {
      let tag = await TagModel.findByPk(id);
      if (tag !== null) {
        await TagModel.destroy({ where: { id } });
        return tag.toJSON();
      } else {
        throw Error(
          "The tag company category was already deleted or, does not exist"
        );
      }
    },
    addTagToCompany: async (
      _parent: any,
      { companyId, tagName }: addTagToCompanyArgs
    ) => {
      let tagCompany = await TagModel.findOne({
        //TagCompanyModel
        where: { name: tagName }
      });

      if (tagCompany) {
        // findOrCreate so that it doesn't add multiple times the tagCompany to a product.
        await TagCompanyModel.findOrCreate({
          where: {
            companyId,
            tagName: tagCompany.name
          }
        });
      } else {
        throw new Error(`The tagCompany ${tagName} doesn't exists.`);
      }
      // let company = await CompanyModel.findOne({
      //   where: { id: companyId },
      //   include: [TagCompanyModel]
      // });
      return tagCompany;
      //company ? company.toJSON() : null;
    }
  }
};
