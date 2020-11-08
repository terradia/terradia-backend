import faker from "faker";
import CustomerModel from "../models/customer.model";
import CustomerAddressModel from "../models/customer-address.model";

declare interface GeoPoint {
  type: string;
  coordinates: number[];
}
declare interface CustomerAddress {
  address: string;
  apartment: string;
  information: string;
  customerId: string;
  location: GeoPoint;
}

const generateAddresses: (
  customer: CustomerModel
) => CustomerAddress[] = customer => {
  const generatedCustomerAddresses: CustomerAddress[] = [];
  for (let i = 0; i < 7; i++) {
    const point = {
      type: "Point",
      coordinates: [
        parseFloat(faker.address.longitude()),
        parseFloat(faker.address.latitude())
      ]
    };
    generatedCustomerAddresses.push({
      address:
        faker.address.streetAddress() +
        faker.address.city() +
        faker.address.zipCode() +
        faker.address.country(),
      location: point,
      apartment: faker.address.secondaryAddress(),
      information: faker.lorem.lines(1),
      customerId: customer.id
    });
  }
  return generatedCustomerAddresses;
};

export const upCustomersAddress: () => void = async () => {
  try {
    let customerAddressesGenerated: any[] = [];
    const customers = await CustomerModel.findAll();
    customers.map(customer => {
      const tmp = generateAddresses(customer);
      customerAddressesGenerated = customerAddressesGenerated.concat(tmp);
    });
    await CustomerAddressModel.bulkCreate(customerAddressesGenerated);
    for (const customer of customers) {
      const customerAddr = await CustomerAddressModel.findAll({
        where: { customerId: customer.id }
      });
      if (customerAddr[0]) {
        await CustomerModel.update(
          {
            activeAddressId: customerAddr[0].id
          },
          { where: { id: customer.id } }
        );
      }
    }
  } catch (err) {
    throw err;
  }
};

export const downCustomersAddress: () => Promise<number> = () => {
  console.log("=== Downing CustomerAddresses ===");
  return CustomerAddressModel.destroy({ where: {} }).catch(err => {
    console.log(err);
  });
};
