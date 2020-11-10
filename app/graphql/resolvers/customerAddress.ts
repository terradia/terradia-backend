import UserModel from "../../database/models/user.model";
import CustomerModel from "../../database/models/customer.model";
import { ApolloError } from "apollo-server";
import CustomerAddressModel from "../../database/models/customer-address.model";
import { combineResolvers } from "graphql-resolvers";
import { isUserAndCustomer } from "./authorization";
import NodeGeocoder, { Geocoder } from "node-geocoder";

interface CreateCustomerAddressData {
  address: string;
  apartment?: number;
  information?: string;
  companyId: string;
  id?: string;
}

declare interface Point {
  type: string;
  coordinates: number[];
}
export default {
  Query: {
    getActiveCustomerAddress: combineResolvers(
      isUserAndCustomer,
      async (
        _: any,
        __: object,
        { user: { customer } }: { user: UserModel }
      ): Promise<CustomerAddressModel | null> => {
        const customerFetched = await CustomerModel.findByPk(customer.id, {
          include: [{ model: CustomerAddressModel, as: "activeAddress" }]
        });
        if (!customerFetched) {
          throw new ApolloError("CustomerNotFound");
        }
        return customerFetched.activeAddress;
      }
    ),
    getAllCustomerAddressesByUser: combineResolvers(
      isUserAndCustomer,
      async (
        _: any,
        __: any,
        { user }: { user: UserModel }
      ): Promise<CustomerAddressModel[] | null> => {
        const customer: CustomerModel = user.customer;
        return CustomerAddressModel.findAll({
          where: { customerId: customer.id },
          include: [
            {
              model: CustomerModel,
              include: [UserModel]
            }
          ]
        });
      }
    )
  },
  Mutation: {
    createOrUpdateCustomerAddress: combineResolvers(
      isUserAndCustomer,
      async (
        _: any,
        { address, apartment, information, id }: CreateCustomerAddressData,
        { user: { customer } }: { user: UserModel }
      ): Promise<
        CustomerAddressModel | [number, CustomerAddressModel[]] | null
      > => {
        const customerAddress = await CustomerAddressModel.findOne({
          where: { customerId: customer.id, address }
        });
        if (!customerAddress) {
          let point: Point = {
            type: "",
            coordinates: []
          };
          const geocoder: Geocoder = NodeGeocoder({
            provider: "openstreetmap"
          });
          await geocoder.geocode(address, function(err, res) {
            if (err)
              throw new ApolloError(
                "OSMError",
                "500"
              );
            if (res.length == 0) {
              return;
            }
            point = {
              type: "Point",
              coordinates: [
                parseFloat(String(res[0].longitude)),
                parseFloat(String(res[0].latitude))
              ]
            };
          });
          if (point.coordinates.length == 0) {
            throw new ApolloError("AddressNotFound", "400");
          }
          const addr: CustomerAddressModel = await CustomerAddressModel.create({
            address,
            apartment,
            information,
            location: point
          });
          CustomerModel.update(
            {
              activeAddressId: addr.id
            },
            { where: { id: customer.id } }
          );
          await addr.$set("customer", customer);
          return CustomerAddressModel.findByPk(addr.id, {
            include: [
              {
                model: CustomerModel,
                include: [UserModel]
              }
            ]
          });
        } else {
          const customerResult: [
            number,
            CustomerAddressModel[]
          ] = await CustomerAddressModel.update(
            { apartment, information },
            { where: { address }, returning: true }
          );
          CustomerModel.update(
            {
              activeAddressId: customerResult[1][0].id
            },
            { where: { id: customer.id } }
          );
          return customerResult[1][0];
        }
      }
    ),
    setActiveCustomerAddress: combineResolvers(
      isUserAndCustomer,
      async (
        _: any,
        { id }: { id: string },
        { user }: { user: UserModel }
      ): Promise<CustomerAddressModel | null> => {
        await CustomerAddressModel.update(
          { active: false },
          { where: { active: true } }
        );
        await CustomerAddressModel.update({ active: true }, { where: { id } });
        return CustomerAddressModel.findByPk(id, {
          include: [CustomerModel]
        });
      }
    )
  }
};
