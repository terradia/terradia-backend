"use strict";

const Sequelize = require("sequelize");

let dbm;
let type;
let seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db
    .createTable("OrdersStatus", {
      id: {
        type: "uuid",
        primaryKey: true,
        notNull: true,
        defaultValue: new String("uuid_generate_v4()")
      },
      slugName: { type: "string", allowNull: false, unique: true },
      translationKey: { type: "string", allowNull: false },
      color: { type: "string", allowNull: false }
    })
    .then(() => {
      return db.createTable("OrdersEvents", {
        id: {
          type: "uuid",
          primaryKey: true,
          notNull: true,
          defaultValue: new String("uuid_generate_v4()")
        },
        createdAt: {
          notNull: true,
          type: new String("TIMESTAMPTZ"),
          defaultValue: new String("now()")
        },
        orderId: { type: "uuid", allowNull: false },
        eventTranslationKey: { type: "string", allowNull: true },
        moreInfo: { type: "string", allowNull: true },
        orderStatus: { type: "uuid", allowNull: false }
      });
    })
    .then(() => {
      return db.createTable("OrdersProducts", {
        id: {
          type: "uuid",
          primaryKey: true,
          notNull: true,
          defaultValue: new String("uuid_generate_v4()")
        },
        name: { type: "string", allowNull: false },
        price: { type: "float", allowNull: false },
        quantityForUnit: { type: "float", allowNull: false },
        unitId: { type: "uuid", allowNull: true },
        orderId: { type: "uuid", allowNull: false }
      });
    })
    .then(() => {
      return db.createTable("OrdersDeliveryInformation", {
        id: {
          type: "uuid",
          primaryKey: true,
          notNull: true,
          defaultValue: new String("uuid_generate_v4()")
        },
        deliveryCode: { type: "string", allowNull: false },
        fromAddress: { type: "string", allowNull: false },
        fromPosition: { type: Sequelize.DataTypes.GEOMETRY("GEOMETRY") },
        toAddress: { type: "string", allowNull: false },
        toPosition: { type: Sequelize.DataTypes.GEOMETRY("GEOMETRY") },
        pickUpAt: { type: new String("TIMESTAMPTZ") },
        dropOffAt: { type: new String("TIMESTAMPTZ") },
        endedAt: { type: new String("TIMESTAMPTZ") },
        distance: { type: "float", allowNull: true },
        price: { type: "float", allowNull: false },
        transportType: { type: "string", allowNull: true }
      });
    })
    .then(() => {
      return db.createTable("Orders", {
        id: {
          type: "uuid",
          primaryKey: true,
          notNull: true,
          defaultValue: new String("uuid_generate_v4()")
        },
        code: { type: "string", allowNull: false },
        customerId: { type: "uuid", allowNull: false },
        orderStatusId: { type: "uuid", allowNull: false },
        createdAt: {
          notNull: true,
          type: new String("TIMESTAMPTZ"),
          defaultValue: new String("now()")
        },
        deliveryInformationId: { type: "uuid", allowNull: false },
        // if the company still exists, we want to be able to find it, even if the name changed
        companyId: { type: "uuid", allowNull: true },
        companyName: { type: "string", allowNull: false }
      });
    });
};

exports.down = function(db) {
  return db
    .dropTable("Orders")
    .then(() => db.dropTable("OrdersDeliveryInformation"))
    .then(() => db.dropTable("OrdersProducts"))
    .then(() => db.dropTable("OrdersEvents"))
    .then(() => db.dropTable("OrdersStatus"));
};

exports._meta = {
  version: 1
};
