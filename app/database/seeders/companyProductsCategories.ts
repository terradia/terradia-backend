import faker from "faker";
import CompanyModel from "../models/company.model";
import ProductModel from "../models/product.model";
import CompanyProductsCategoryModel from "../models/company-products-category.model";

async function generateCompanyProductCategory(companyId: string) {
  let categoriesGenerated: any[] = [];
  for (let i = 0; i < 4; i++) {
    categoriesGenerated.push({
      name: faker.commerce.product(),
      companyId
    });
  }
  return categoriesGenerated;
}

export const upCompanyProductsCategories: any = async () => {
  try {
    const companies = await CompanyModel.findAll();
    let categoriesGenerated: any[] = [];
    await companies.map(async (element: CompanyModel) => {
      let tmp = await generateCompanyProductCategory(element.id);
      categoriesGenerated = categoriesGenerated.concat(tmp);
      return element;
    });
    return await CompanyProductsCategoryModel.bulkCreate(categoriesGenerated);
  } catch (err) {
    throw err;
  }
};
export const downCompanyProductsCategories: any = () => {
  return CompanyProductsCategoryModel.destroy({ where: {} }).catch(err => {
    console.log(err);
  });
};
