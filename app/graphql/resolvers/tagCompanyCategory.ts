import ProductCategoryModel from "../../database/models/product-category.model";
import TagCompanyCategoryModel from "../../database/models/tag-company-category.model";
import CompanyModel from "../../database/models/company.model";

export default {
  Query: {
    getAllTagCompanyCategories: async () => {
      return TagCompanyCategoryModel.findAll({
        include: [CompanyModel]
      });
    },
    getTagCompanyCategoryByName: async (_parent: any, { name }: { name: string }) => {
      return TagCompanyCategoryModel.findOne({
        where: { name },
        include: [CompanyModel]
      });
    }
  },
  Mutation: {
    createTagCompanyCategory: async (
      _parent: any,
      _args: { name: string; parentCategoryId?: string }
    ) => {
      let category = await TagCompanyCategoryModel.create(_args);
      return category.toJSON();
    },
    deleteTagCompanyCategory: async (_parent: any, { id }: { id: string }) => {
      let category = await TagCompanyCategoryModel.findByPk(id);
      if (category !== null) {
        await TagCompanyCategoryModel.destroy({ where: { id } });
        await ProductCategoryModel.destroy({ where: { categoryId: id } });
        return category.toJSON();
      } else {
        throw Error("The tag company category was already deleted or, does not exist");
      }
    }
  }
};
