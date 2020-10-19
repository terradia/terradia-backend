"use strict";

var dbm;
var type;
var seed;

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
    .runSql(
      `CREATE TYPE enum_order_status AS ENUM ('PENDING', 'ACCEPTED', 'AVAILABLE', 'DECLINED');`
    )
    .then(() => {
      return db.createTable("Orders", {
        id: {
          type: "uuid",
          primaryKey: true,
          notNull: true,
          defaultValue: new String("uuid_generate_v4()")
        },
        code: {
          type: "string",
          allowNull: false
        },
        customerId: {
          type: "uuid",
          allowNull: false
        },
        companyId: {
          type: "uuid",
          allowNull: false
        },
        createdAt: {
          notNull: true,
          type: new String("TIMESTAMPTZ"),
          defaultValue: new String("now()")
        },
        updatedAt: {
          notNull: true,
          type: new String("TIMESTAMPTZ"),
          defaultValue: new String("now()")
        },
        price: {
          type: "float"
        },
        numberProducts: {
          type: "integer"
        },
        status: {
          type: "enum_order_status",
          defaultValue: "PENDING"
        }
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
        productId: {
          type: "uuid",
          allowNull: false
        },
        orderId: {
          type: "uuid",
          allowNull: false
        },
        quantity: {
          type: "integer",
          allowNull: false
        },
        price: {
          type: "float",
          allowNull: false
        }
      });
    });
};

exports.down = function(db) {
  return db
    .dropTable("OrdersProducts")
    .then(() => {
      return db.dropTable("Orders");
    })
    .then(() => {
      return db.runSql('DROP TYPE IF EXISTS "enum_order_status";');
    });
};

exports._meta = {
  version: 1
};
