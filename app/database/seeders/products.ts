import faker from "faker";
import CompanyModel from "../models/company.model";
import ProductModel from "../models/product.model";

async function generateProducts(companyId: string) {
  let productsGenerated: any[] = [];
  for (let i = 0; i < 10; i++) {
    productsGenerated.push({
      name: faker.commerce.product(),
      description: faker.lorem.paragraph(),
      companyId
    });
  }
  return productsGenerated;
}

export const upProducts: any = async () => {
  try {
    const companies = await CompanyModel.findAll();
    let generatedProducts: any[] = [];
    await companies.map(async (element: CompanyModel) => {
      let tmp = await generateProducts(element.id);
      generatedProducts = generatedProducts.concat(tmp);
      return element;
    });
    return await ProductModel.bulkCreate(generatedProducts);
  } catch (err) {
    throw err;
  }
};
export const downProducts: any = () => {
  return ProductModel.destroy({ where: {} }).catch(err => {
    console.log(err);
  });
};
