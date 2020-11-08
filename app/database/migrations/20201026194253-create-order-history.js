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
      `CREATE TYPE enum_orders_history_status AS ENUM ('FINISHED', 'DECLINED', 'CANCELED');`
    )
    .then(() => {
      db.createTable("OrdersHistory", {
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
          allowNull: true
        },
        companyId: {
          type: "uuid",
          allowNull: true
        },
        companyName: {
          type: "string",
          allowNull: false
        },
        companyLogo: {
          type: "string",
          allowNull: true
        },
        companyAddress: {
          type: "string",
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
        decliningReason: {
          type: "string",
          allowNull: true
        },
        status: {
          type: "enum_orders_history_status",
          defaultValue: "FINISHED"
        }
      });
    })
    .then(() => {
      return db.createTable("OrdersProductsHistory", {
        id: {
          type: "uuid",
          primaryKey: true,
          notNull: true,
          defaultValue: new String("uuid_generate_v4()")
        },
        orderHistoryId: {
          type: "uuid",
          allowNull: false
        },
        productId: {
          type: "uuid",
          allowNull: true
        },
        name: {
          type: "string",
          allowNull: false
        },
        quantity: {
          type: "integer",
          allowNull: false
        },
        price: {
          type: "float",
          allowNull: false
        },
        unitId: {
          type: "uuid",
          allowNull: false
        },
        quantityForUnit: {
          type: "integer",
          allowNull: false
        }
      });
    })
    .then(() => {
      return db.addColumn("Carts", "numberProducts", {
        type: "integer"
      });
    });
};

exports.down = function(db) {
  return db
    .dropTable("OrdersProductsHistory")
    .then(() => {
      return db.dropTable("OrdersHistory");
    })
    .then(() => {
      return db.runSql('DROP TYPE IF EXISTS "enum_orders_history_status";');
    })
    .then(() => {
      return db.removeColumn("Carts", "numberProducts");
    });
};

exports._meta = {
  version: 1
};
