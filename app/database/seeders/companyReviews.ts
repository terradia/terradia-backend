import CompanyModel from "../models/company.model";
import CompanyReviewModel from "../models/company-review.model";
import CustomerModel from "../models/customer.model";
import generateReviews, {CompanyReview} from "./reviewGenerator";

export const upCompaniesReviews: () => Promise<CompanyReview[]> = async () => {
    try {
        let companyReviewsGenerated: CompanyReview[] = [];
        const companies = await CompanyModel.findAll();
        const customers = await CustomerModel.findAll();
        companies.map(company => {
            const tmp: CompanyReview[] = generateReviews(company, customers);
            companyReviewsGenerated = companyReviewsGenerated.concat(tmp);
        });
        return CompanyReviewModel.bulkCreate(companyReviewsGenerated);
    } catch (err) {
        throw err;
    }
};

export const downCompaniesReviews: () => Promise<number> = () => {
    return CompanyReviewModel.destroy({where: {}}).catch(err => {
        console.log(err);
    });
};