import CustomerModel from "../models/customer.model";
import UserModel from "../models/user.model";

declare interface Customer {
  userId: string;
}

export const upCustomers: () => Promise<CustomerModel[]> = async () => {
  try {
    const users = await UserModel.findAll();
    const customers: Customer[] = [];
    users.map(user => {
      const rand: number = Math.round(Math.random() * 2);
      if (rand === 1 || user.firstName === "root")
        customers.push({ userId: user.id });
    });
    return await CustomerModel.bulkCreate(customers);
  } catch (err) {
    throw err;
  }
};

export const downCustomers: () => Promise<number> = () => {
  return CustomerModel.destroy({ where: {} }).catch(err => {
    console.log(err);
  });
};
