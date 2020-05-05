"use strict";

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
    .createTable("CompanyImages", {
      id: {
        type: "uuid",
        primaryKey: true,
        notNull: true,
        defaultValue: new String("uuid_generate_v4()")
      },
      filename: {
        type: "string",
        allowNull: false
      },
      companyId: {
        type: "uuid",
        allowNull: true
      },
      productId: {
        type: "uuid",
        allowNull: true
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
      }
    }).then(() => {
      return db.addColumn("Companies", "logoId", {
        type: "uuid",
        allowNull: false
      });
    }).then(() => {
      return db.addColumn("Companies", "coverId", {
        type: "uuid",
        allowNull: false
      });
    }).then(() => {
      return db.addColumn("Products", "coverId", {
        type: "uuid",
        allowNull: false
      });
    });
};

exports.down = function(db) {
  return db.dropTable("CompanyImages")
    .then(() => db.removeColumn("Companies", "logoId"))
    .then(() => db.removeColumn("Companies", "coverId"))
    .then(() => db.removeColumn("Products", "coverId"));
};

exports._meta = {
  version: 1
};
