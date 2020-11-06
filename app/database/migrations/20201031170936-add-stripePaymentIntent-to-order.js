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
  db.addColumn("Orders", "stripePaymentIntent", {
    type: "string"
  });
  return db.addColumn("OrdersHistory", "stripePaymentIntent", {
    type: "string"
  });
};

exports.down = function(db) {
  db.removeColumn("Orders", "stripePaymentIntent");
  return db.removeColumn("OrdersHistory", "stripePaymentIntent");
};

exports._meta = {
  version: 1
};
