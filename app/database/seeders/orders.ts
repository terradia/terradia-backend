import faker from "faker";
import OrderModel from "../models/order.model";
import CustomerModel from "../models/customer.model";
import CompanyModel from "../models/company.model";
import ProductModel from "../models/product.model";
import OrderProductModel from "../models/order-product.model";

interface order {
  code: string;
  customerId: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  price: number;
  numberProducts: number;
  status: string;
  decliningReason: string;
}

const generateOrders = async (): Promise<OrderModel[]> => {
  const generatedOrders: any[] = [];

  const customers = await CustomerModel.findAll();
  const companies = await CompanyModel.findAll({
    include: [ProductModel]
  });

  for (const customer of customers) {
    const numberOrders = Math.floor(Math.random() * 6) + 5;
    for (let i = 0; i < numberOrders; i++) {
      for (const company of companies) {
        generatedOrders.push(
          await OrderModel.create({
            customerId: customer.id,
            companyId: company.id,
            price: Math.random() * 1000,
            numberProducts: Math.floor(Math.random() * 100),
            status: "PENDING"
          }).then(async order => {
            await OrderModel.update(
              {
                code: order.id.substr(0, 6)
              },
              { where: { id: order.id } }
            );
            const randomProduct =
              company.products[
                Math.floor(Math.random() * company.products.length)
              ];
            try {
              if (order && randomProduct) {
                await OrderProductModel.create({
                  price: randomProduct.price,
                  orderId: order.id,
                  productId: randomProduct.id,
                  quantity: Math.floor(Math.random() * 15)
                });
              }
            } catch (e) {
              console.log(e);
            }
          })
        );
      }
    }
  }
  return generatedOrders;
};

export const upOrders: () => Promise<OrderModel[]> = async () => {
  return generateOrders();
};

export const downOrders: () => Promise<number> = () => {
  return OrderModel.destroy({ where: {} });
};
