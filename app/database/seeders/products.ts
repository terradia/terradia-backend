import faker from "faker";
import CompanyModel from "../models/company.model";
import ProductModel from "../models/product.model";
import CompanyProductsCategoryModel from "../models/company-products-category.model";

const NUMBER_OF_COMPANY_PRODUCTS_CATEGORIES = 3;

declare interface products {
  name: string;
  description: string;
  companyId: string;
  averageMark: number;
  numberOfMarks: number;
  companyProductCategoryId: string;
}

async function generateProducts(companyId: string): Promise<void> {
  const companyProductCategories = await CompanyProductsCategoryModel.findAll({
    where: { companyId }
  });

  for (let i = 0; i < 10; i++) {
    const rand: number = Math.round(
      Math.random() * NUMBER_OF_COMPANY_PRODUCTS_CATEGORIES
    );
    const categorySelected = companyProductCategories[rand].id;
    const category: CompanyProductsCategoryModel | null = await CompanyProductsCategoryModel.findOne(
      {
        where: { id: categorySelected },
        include: [ProductModel, CompanyModel]
      }
    );
    if (category) {
      const productCreated = {
        name: faker.commerce.product(),
        description: faker.lorem.paragraph(Math.random() * 3 + 1),
        companyId,
        averageMark: parseFloat((Math.random() * 5).toFixed(2)),
        numberOfMarks: Math.floor(Math.random() * 99) + 1,
        companyProductsCategoryId: categorySelected,
        position: category.products.length,
        price: Math.random() * 100,
        quantityForUnit: Math.round(Math.random() * 3) + 1,
        unitId: "029d2554-7918-11ea-bc55-0242ac130003"
      };
      await ProductModel.create(productCreated);
    }
  }
}

export const upProducts: () => Promise<void> = async () => {
  const companies = await CompanyModel.findAll();
  for (const element of companies) {
    await generateProducts(element.id);
  }
};

export const downProducts: () => Promise<number> = () => {
  console.log("=== Downing Products ===");
  return ProductModel.destroy({ where: {} }).catch(err => {
    console.log(err);
  });
};
