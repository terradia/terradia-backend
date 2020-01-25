import CompanyReviewModel from "../../database/models/company-review.model";
import UserModel from "../../database/models/user.model";
import CustomerModel from "../../database/models/customer.model";
import CompanyModel from "../../database/models/company.model";
import { ApolloError } from "apollo-server";
import AddressModel from "../../database/models/address.model";
import {where} from "sequelize";

interface createAddressData {
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
    getActiveAddress: async (
        _parent: any,
        {}, {user}:argumentsData, {}
    ) => {
      return AddressModel.findOne({where: {active: true}});
    },
    getAllAddressesByUser: async (
        _parent: any,
        {}, {user}:argumentsData, {}
    ) => {
      const customer = user.customer.toJSON();
      return AddressModel.findAll({
        where: {customerId: customer.id},
        include: [
          CustomerModel
        ]
      })
    }
  },
  Mutation: {
    createOrUpdateAddress: async (
        _parent,
        {address, apartment, information,id}: createAddressData,
        {user}: argumentsData
    ) => {
      console.log(id);
      const customer = user.customer.toJSON();
      if (customer) {
        await AddressModel.update({active: false}, {where: {active: true}});
        if (id) {
          await AddressModel.update({address, apartment, information, active: true}, {where: {id}});
        }
        else  {
          return AddressModel.create({
            address,
            apartment,
            information
          }).then(async addr => {
            console.log(addr);
            await addr.setCustomer(customer.id);
            return AddressModel.findByPk(addr.id, {
              include: [CustomerModel]
            });
          });
        }
      } else {
        throw new ApolloError("You need to be a customer review a product.", "403");
      }
    },
    setActiveAddress: async (
        _parent,
        {id}: setActiveData,
        {user}: argumentsData
    ) => {
      await AddressModel.update({active: false}, {where: {active: true}});
      AddressModel.update({active: true}, {where: {id}});
      return AddressModel.findByPk(id, {
        include: [CustomerModel]
      });
    }
  }
};
