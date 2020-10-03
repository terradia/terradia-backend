import faker from "faker";
import CompanyModel from "../models/company.model";
import Bluebird from "bluebird";

declare interface GeoPoint {
  type: string;
  coordinates: number[];
}

interface Company {
  name: string;
  description: string;
  address: string;
  siren: string;
  phone: string;
  email: string;
  geoPosition: GeoPoint;
  averageMark: number;
  numberOfMarks: number;
}

async function generateCompanies(): Promise<Company[]> {
  const companiesGenerated: Company[] = [];
  for (let i = 0; i < 10; i++) {
    const address = faker.address.streetAddress(true);
    const point = {
      type: "Point",
      coordinates: [
        parseFloat(faker.address.longitude()),
        parseFloat(faker.address.latitude())
      ]
    };
    companiesGenerated.push({
      name: faker.company.companyName(),
      description: faker.company.catchPhraseDescriptor(),
      address,
      siren: faker.random.number().toString(),
      phone: faker.random.number().toString(),
      email: faker.internet.email(),
      geoPosition: point,
      averageMark: parseFloat((Math.random() * 5).toFixed(2)),
      numberOfMarks: Math.floor(Math.random() * 99) + 1
    });
  }
  return companiesGenerated;
}

export const upCompanies: () => Promise<CompanyModel[]> = async () => {
  try {
    const companiesGenerated = await generateCompanies();
    return await CompanyModel.bulkCreate(companiesGenerated);
  } catch (err) {
    throw err;
  }
};

export const downCompanies: () => Bluebird<number | void> = () => {
  return CompanyModel.destroy({ where: {} }).catch(err => {
    console.log(err);
  });
};
