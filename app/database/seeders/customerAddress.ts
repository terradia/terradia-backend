import faker from "faker";
import CustomerModel from "../models/customer.model";
import CustomerAddressModel from "../models/customer-address.model";

declare interface customerAddress {
    address: string,
    apartment: string,
    information: string,
    active: boolean,
    customerId: string
}

const generateAddresses: (customer: CustomerModel) => customerAddress[] = (customer) => {
    let generatedCustomerAddresses: customerAddress[] = [];
    for (let i = 0; i < 7; i++) {
        generatedCustomerAddresses.push({
            address: faker.address.streetAddress() + faker.address.city() + faker.address.zipCode() + faker.address.country(),
            apartment: faker.address.secondaryAddress(),
            information: faker.lorem.lines(1),
            active: i == 0,
            customerId: customer.id,
        });
    }
    return generatedCustomerAddresses;
};

export const upCustomersAddress: () => Promise<CustomerAddressModel[]> = async () => {
    try {
        let customerAddressesGenerated: any[] = [];
        const customers = await CustomerModel.findAll();
        customers.map((customer) => {
            const tmp = generateAddresses(customer);
            customerAddressesGenerated = customerAddressesGenerated.concat(tmp);
        });
        return CustomerAddressModel.bulkCreate(customerAddressesGenerated);
    } catch (err) {
        throw err;
    }
};

export const downCustomersAddress: () => Promise<number> = () => {
    return CustomerAddressModel.destroy({where: {}}).catch(err => {
        console.log(err);
    });
};