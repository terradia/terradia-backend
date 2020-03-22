import UserModel from "../../database/models/user.model";
import CustomerModel from "../../database/models/customer.model";
import { ApolloError } from "apollo-server";
import CustomerAddressModel from "../../database/models/customer-address.model";

interface createCustomerAddressData {
  address: string;
  apartment?: number;
  information?: string;
  companyId: string;
  id?: string
}

interface setActiveData {
  id: string;
}

interface argumentsData {
  user: UserModel;
}

export default {
  Query: {
    getActiveCustomerAddress: async (
        _parent: any,
        {}, {user}:argumentsData, {}
    ) => {
      return CustomerAddressModel.findOne({where: {active: true}});
    },
    getAllCustomerAddressesByUser: async (
        _parent: any,
        {}, {user}:argumentsData, {}
    ) => {
      const customer = user.customer;
      return CustomerAddressModel.findAll({
        where: {customerId: customer.id},
        include: [
          CustomerModel
        ]
      })
    }
  },
  Mutation: {
    createOrUpdateCustomerAddress: async (
        _parent,
        {address, apartment, information,id}: createCustomerAddressData,
        {user}: argumentsData
    ) => {
      const customer = user.customer.toJSON();
      if (customer) {
        await CustomerAddressModel.update({active: false}, {where: {active: true}});
        if (id) {
          await CustomerAddressModel.update({address, apartment, information, active: true}, {where: {id}});
        }
        else  {
          return CustomerAddressModel.create({
            address,
            apartment,
            information
          }).then(async addr => {
            console.log(addr);
            await addr.setCustomer(customer.id);
            return CustomerAddressModel.findByPk(addr.id, {
              include: [CustomerModel]
            });
          });
        }
      } else {
        throw new ApolloError("You need to be a customer review a product.", "403");
      }
    },
    setActiveCustomerAddress: async (
        _parent,
        {id}: setActiveData,
        {user}: argumentsData
    ) => {
      await CustomerAddressModel.update({active: false}, {where: {active: true}});
      CustomerAddressModel.update({active: true}, {where: {id}});
      return CustomerAddressModel.findByPk(id, {
        include: [CustomerModel]
      });
    }
  }
};
