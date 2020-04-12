import faker from "faker";
import CompanyModel from "../models/company.model";
import CompanyProductsCategoryModel from "../models/company-products-category.model";

declare interface CompanyProductsCategories {
  name: string,
  companyId: string
}

const generateCompanyProductCategory: (companyId: string) => CompanyProductsCategories[] = (companyId) => {
  let categoriesGenerated: any[] = [];
  for (let i = 0; i < 4; i++) {
    categoriesGenerated.push({
      name: faker.commerce.product(),
      companyId
    });
  }
  return categoriesGenerated;
};

export const upCompanyProductsCategories: () => Promise<CompanyProductsCategories[]> = async () => {
  try {
    const companies = await CompanyModel.findAll();
    let categoriesGenerated: CompanyProductsCategories[] = [];
    companies.map( (element: CompanyModel) => {
      let tmp = generateCompanyProductCategory(element.id);
      categoriesGenerated = categoriesGenerated.concat(tmp);
      return element;
    });
    return await CompanyProductsCategoryModel.bulkCreate(categoriesGenerated);
  } catch (err) {
    throw err;
  }
};

export const downCompanyProductsCategories: () => Promise<number> | void = () => {
  return CompanyProductsCategoryModel.destroy({ where: {} }).catch(err => {
    console.log(err);
  });
};
