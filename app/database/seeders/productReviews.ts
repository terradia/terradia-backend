import CustomerModel from "../models/customer.model";
import ProductModel from "../models/product.model";
import ProductReviewModel from "../models/product-review.model";
import generateReviews, {ProductReview} from "./reviewGenerator";

export const upProductsReviews: any = async () => {
    try {
        let productReviewsGenerated: ProductReview[] = [];
        const products = await ProductModel.findAll();
        const customers = await CustomerModel.findAll();
        products.map((product) => {
            const tmp: ProductReview[] = generateReviews(product, customers);
            productReviewsGenerated = productReviewsGenerated.concat(tmp);
        });
        productReviewsGenerated.map(productReview => {
            return ProductReviewModel.bulkCreate([productReview]).catch(error => {
                console.log(error);
                console.log(productReview);
            });
        })
    } catch (err) {
        throw err;
    }
};

export const downProductsReviews: () => Promise<number> = () => {
    console.log("=== Downing ProductReviews ===");
    return ProductReviewModel.destroy({where: {}}).catch(err => {
        console.log(err);
    });
};