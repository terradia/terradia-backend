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
  return db.createTable("ProductsCompanyImages", {
    id: {
      type: "uuid",
      primaryKey: true,
      notNull: true,
      defaultValue: new String("uuid_generate_v4()")
    },
    productId: {
      type: "uuid",
      notNull: true
    },
    companyImageId: {
      type: "uuid",
      notNull: true
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
  });
};

exports.down = function(db) {
  return db.dropTable("ProductsCompanyImages");
};

exports._meta = {
  version: 1
};
