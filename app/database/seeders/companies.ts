import faker from "faker";
import CompanyModel from "../models/company.model";

interface company {
    name: string;
    description: string;
    address: string;
    position: any;
}

async function generateCompanies(): [company] {
    let companiesGenerated = [];
    for (let i = 0; i < 10; i++) {
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
            position: point,
            averageMark: (Math.random() * 5).toFixed(2),
            numberOfMarks: Math.floor(Math.random() * 99) + 1
        });
    }
    return companiesGenerated;
}



export const upCompanies: any = async () => {
    try {
        const companiesGenerated = await generateCompanies();
        return await CompanyModel.bulkCreate(companiesGenerated);
    } catch (err) {
        throw err;
    }
};
export const downCompanies: any = () => {
    return CompanyModel.destroy({where: {}}).catch(err => {
        console.log(err);
    });
};