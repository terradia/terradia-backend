import faker from "faker";
import CompanyModel from "../models/company.model";
import NodeGeocoder from "node-geocoder";
import {ApolloError} from "apollo-server-errors";

interface company {
    name: string;
    description: string;
    address: string;
    position: any;
}

const nb = 50;

async function generateCompanies() : [company]  {
    let companiesGenerated = [];
    for (let i = 0 ; i < nb ; i++) {
        let address = faker.address.streetAddress(true);
        let point = {
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
            position: point
        });
    }
    return companiesGenerated;
}

export const upCompanies: any = async () => {
    const companiesGenerated = await generateCompanies();
    return CompanyModel.bulkCreate(companiesGenerated);
};
export const downCompanies: any = () =>
    CompanyModel.destroy({ where: {} }).catch(err => {
        console.log(err);
    });