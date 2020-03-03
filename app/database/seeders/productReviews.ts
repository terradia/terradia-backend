import faker from "faker";
import CustomerModel from "../models/customer.model";
import ProductModel from "../models/product.model";
import ProductReviewModel from "../models/product-review.model";

async function generateProductReviews(product: ProductModel, customers: CustomerModel[]): any[] {
    let productReviewsGenerated: any[] = [];
    const rand: number = Math.floor(Math.random() * 100);
    for (let i = 0; i < rand; i++) {
        let customerMark = Math.floor(Math.random() * 4) + 1;
        productReviewsGenerated.push({
            title: faker.name.title(),
            description: faker.lorem.paragraph(),
            customerMark,
            customerId: customers[Math.floor(Math.random() * customers.length)].id,
            productId: product.id
        });
    }
    return productReviewsGenerated;
}

export const upProductsReviews: any = async () => {
    try {
        let productReviewsGenerated: any[] = [];
        const products = await ProductModel.findAll();
        const customers = await CustomerModel.findAll();
        await products.map(async (product) => {
            const tmp = await generateProductReviews(product, customers);
            productReviewsGenerated = productReviewsGenerated.concat(tmp);
        });
        return ProductReviewModel.bulkCreate(productReviewsGenerated);
    } catch (err) {
        throw err;
    }
};
export const downProductsReviews: any = () => {
    return ProductReviewModel.destroy({where: {}}).catch(err => {
        console.log(err);
    });
};