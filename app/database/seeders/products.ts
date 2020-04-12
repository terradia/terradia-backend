import faker from "faker";
import CompanyModel from "../models/company.model";
import ProductModel from "../models/product.model";
import CompanyProductsCategoryModel from "../models/company-products-category.model";

const NUMBER_OF_COMPANY_PRODUCTS_CATEGORIES = 3;

declare interface products {
  name: string,
  description: string,
  companyId: string,
  averageMark: number,
  numberOfMarks: number,
  companyProductCategoryId: string
}

async function generateProducts(companyId: string): Promise<products[]> {
  let productsGenerated: any[] = [];
  const companyProductCategories = await CompanyProductsCategoryModel.findAll({where: {companyId}});
  for (let i = 0; i < 10; i++) {
    const rand: number = Math.round(Math.random() * NUMBER_OF_COMPANY_PRODUCTS_CATEGORIES);
    productsGenerated.push({
      name: faker.commerce.product(),
      description: faker.lorem.paragraph(Math.random() * 3 + 1),
      companyId,
      averageMark: parseFloat((Math.random() * 5).toFixed(2)),
      numberOfMarks: Math.floor(Math.random() * 99) + 1,
      companyProductsCategoryId: companyProductCategories[rand].id
    });
  }
  return productsGenerated;
}

export const upProducts: () => Promise<void> = async () => {
  try {
    const companies = await CompanyModel.findAll();
    for (const element of companies) {
      let tmp = await generateProducts(element.id);
      await ProductModel.bulkCreate(tmp);
    }
  } catch (err) {
    throw err;
  }
};

export const downProducts: () => Promise<number> = () => {
  return ProductModel.destroy({ where: {} }).catch(err => {
    console.log(err);
  });
};
