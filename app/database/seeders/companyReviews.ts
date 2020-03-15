import faker from "faker";
import CompanyModel from "../models/company.model";
import CompanyReviewModel from "../models/company-review.model";
import CustomerModel from "../models/customer.model";

async function generateCompanyReviews(company: CompanyModel, customers: CustomerModel[]): any[] {
    let companyReviewsGenerated: any[] = [];
    const rand: number = Math.floor(Math.random() * 100);
    for (let i = 0; i < rand; i++) {
        let customerMark = Math.floor(Math.random() * 4) + 1;
        companyReviewsGenerated.push({
            title: faker.name.title(),
            description: faker.lorem.paragraph(),
            customerMark,
            customerId: customers[Math.floor(Math.random() * customers.length)].id,
            companyId: company.id
        });
    }
    return companyReviewsGenerated;
}

export const upCompaniesReviews: any = async () => {
    try {
        let companyReviewsGenerated: any[] = [];
        const companies = await CompanyModel.findAll();
        const customers = await CustomerModel.findAll();
        await companies.map(async (company) => {
            const tmp = await generateCompanyReviews(company, customers);
            companyReviewsGenerated = companyReviewsGenerated.concat(tmp);
        });
        return CompanyReviewModel.bulkCreate(companyReviewsGenerated);
    } catch (err) {
        throw err;
    }
};
export const downCompaniesReviews: any = () => {
    return CompanyReviewModel.destroy({where: {}}).catch(err => {
        console.log(err);
    });
};