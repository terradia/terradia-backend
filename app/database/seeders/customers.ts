import CustomerModel from "../models/customer.model";
import UserModel from "../models/user.model";

export const upCustomers: any = async () => {
    try {
        const users = await UserModel.findAll();
        const customers: any[] = [];
        await users.map(async (user) => {
            const rand: number = parseInt(Math.random() * 4);
            if (rand === 1) customers.push({ userId: user.id });
        });
        return (CustomerModel.bulkCreate(customers))
    } catch (err) {
        throw err;
    }
};
export const downCustomers: any = () => {
    return CustomerModel.destroy({where: {}}).catch(err => {
        console.log(err);
    });
};