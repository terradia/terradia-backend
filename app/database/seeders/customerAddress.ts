import faker from "faker";
import CustomerModel from "../models/customer.model";
import CustomerAddressModel from "../models/customer-address.model";

async function generateCompanyReviews(customer: CustomerModel): any[] {
    let customerAddressesGenerated: any[] = [];
    const rand: number = Math.floor(Math.random() * 10);
    for (let i = 0; i < rand; i++) {
        customerAddressesGenerated.push({
            address: faker.address.streetAddress() + faker.address.city() + faker.address.zipCode() + faker.address.country(),
            apartment: faker.address.secondaryAddress(),
            information: faker.lorem.lines(1),
            active: i == 0,
            customerId: customer.id,
        });
    }
    return customerAddressesGenerated;
}

export const upCustomersAddress: any = async () => {
    try {
        let customerAddressesGenerated: any[] = [];
        const customers = await CustomerModel.findAll();
        await customers.map(async (customer) => {
            const tmp = await generateCompanyReviews(customer);
            customerAddressesGenerated = customerAddressesGenerated.concat(tmp);
        });
        return CustomerAddressModel.bulkCreate(customerAddressesGenerated);
    } catch (err) {
        throw err;
    }
};
export const downCustomersAddress: any = () => {
    return CustomerAddressModel.destroy({where: {}}).catch(err => {
        console.log(err);
    });
};