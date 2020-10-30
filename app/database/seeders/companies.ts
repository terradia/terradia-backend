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
    const newPoint = {
      type: "Point",
      coordinates: [
        Math.random() * (7.332832 - 7.363075) + 7.363075,
        Math.random() * (48.878577 - 48.420203) + 48.420203
      ]
    };
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
      geoPosition: newPoint,
      averageMark: parseFloat((Math.random() * 5).toFixed(2)),
      numberOfMarks: Math.floor(Math.random() * 99) + 1,
      email: faker.internet.email(),
      phone: faker.phone.phoneNumber()
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
