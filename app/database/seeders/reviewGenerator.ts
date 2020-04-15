import faker from "faker";
import CompanyModel from "../models/company.model";
import ProductModel from "../models/product.model";
import CustomerModel from "../models/customer.model";

export declare interface CompanyReview {
    title: string,
    description: string,
    customerMark: number,
    customerId: string,
    companyId?: string
}

export declare interface ProductReview {
    title: string,
    description: string,
    customerMark: number,
    customerId: string,
    productId?: string
}

declare type isCompany<T> = T extends CompanyModel ? CompanyReview[]: ProductReview[];

function generateReviews<T extends CompanyModel | ProductModel>
(model: T, customers: CustomerModel[]): isCompany<T> {
    let reviewsGenerated: isCompany<T> = [] as unknown as isCompany<T>;
    const rand: number = Math.floor(Math.random() * 100);
    const id: string = (model instanceof CompanyModel) ? "CompanyId" : "productId";
    for (let i = 0; i < rand; i++) {
        let customerMark = Math.floor(Math.random() * 4) + 1;
        reviewsGenerated.push({
            title: faker.name.title(),
            description: faker.lorem.paragraph(),
            customerMark,
            customerId: customers[Math.floor(Math.random() * customers.length)].id,
            [id]: model.id
        });
    }
    return reviewsGenerated;
}

export default generateReviews;