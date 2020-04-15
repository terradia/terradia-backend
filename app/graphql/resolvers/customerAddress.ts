import UserModel from "../../database/models/user.model";
import CustomerModel from "../../database/models/customer.model";
import {ApolloError} from "apollo-server";
import CustomerAddressModel from "../../database/models/customer-address.model";
import { combineResolvers } from "graphql-resolvers";
import { isUserAndCustomer } from "./authorization";

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
        getActiveCustomerAddress: combineResolvers(isUserAndCustomer,
          async (
            _: any,
            __: object,
            {user}: argumentsData
        ): Promise<CustomerAddressModel | null> => {
            return CustomerAddressModel.findOne({where: {active: true}});
        }),
        getAllCustomerAddressesByUser: combineResolvers(isUserAndCustomer,
          async (
            _: any,
            __: any, {user}: argumentsData
        ): Promise<CustomerAddressModel[] | null> => {
            const customer: CustomerModel = user.customer;
            return CustomerAddressModel.findAll({
                where: {customerId: customer.id},
                include: [
                  {
                    model: CustomerModel,
                    include: [UserModel]
                  }
                ]
            })
        })
    },
    Mutation: {
        createOrUpdateCustomerAddress: combineResolvers(isUserAndCustomer,
          async (
            _: any,
            {address, apartment, information, id}: createCustomerAddressData,
            {user}: argumentsData
        ): Promise<CustomerAddressModel | [number, CustomerAddressModel[]] | null> => {
            const customer: CustomerModel = user.customer;
            if (customer) {
                await CustomerAddressModel.update({active: false}, {where: {active: true}});
                if (id) {
                    return CustomerAddressModel.update({address, apartment, information, active: true}, {where: {id}});
                } else {
                    let addr: CustomerAddressModel = await CustomerAddressModel.create({
                        address,
                        apartment,
                        information
                    });
                    await addr.$set("customer", customer);
                    return CustomerAddressModel.findByPk(addr.id, {
                        include: [
                            {
                                model: CustomerModel,
                                include: [UserModel]
                            }
                        ]
                    });
                }
            } else {
                throw new ApolloError("You need to be a customer review a product.", "403");
            }
        }),
        setActiveCustomerAddress: combineResolvers(isUserAndCustomer,
          async (
            _: any,
            {id}: setActiveData,
            {user}: argumentsData
        ): Promise<CustomerAddressModel | null> => {
            await CustomerAddressModel.update({active: false}, {where: {active: true}});
            await CustomerAddressModel.update({active: true}, {where: {id}});
            return CustomerAddressModel.findByPk(id, {
                include: [CustomerModel]
            });
        })
    }
};
