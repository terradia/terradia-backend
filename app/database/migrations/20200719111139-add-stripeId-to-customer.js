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
  return db.addColumn("Customers", "stripeId", {
    type: "string"
  });
};

exports.down = function(db) {
  return db.removeColumn("Customers", "stripeId");
};

exports._meta = {
  version: 1
};
