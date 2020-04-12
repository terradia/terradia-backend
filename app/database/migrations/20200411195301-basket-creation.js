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
    .createTable("BasketProducts", {
      id: {
        type: "uuid",
        primaryKey: true,
        notNull: true,
        defaultValue: new String("uuid_generate_v4()")
      },
      quantity: {
        type: "integer",
        allowNull: false
      },
      productId: {
        type: "uuid",
        allowNull: false
      },
      basketId: {
        type: "uuid",
        allowNull: false
      }
    })
    .then(() => {
      return db.createTable("Baskets", {
        id: {
          type: "uuid",
          primaryKey: true,
          notNull: true,
          defaultValue: new String("uuid_generate_v4()")
        },
        companyId: {
          type: "uuid",
          allowNull: false
        },
        customerId: {
          type: "uuid",
          allowNull: false
        },
        expirationDate: {
          type: "date",
          allowNull: true
        }
      });
    });
};

exports.down = function(db) {
  db.dropTable("BasketProducts");
  return db.dropTable("Baskets");
};

exports._meta = {
  version: 1
};
