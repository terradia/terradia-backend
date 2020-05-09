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

// Be sure that PostGIS is installed on the Computer / Server so that PostGreSQL is able to find the extension.
exports.up = function(db) {
  return db
    .runSql("CREATE EXTENSION IF NOT EXISTS postgis;")
    .then(() => {
      db.addColumn(
        "CustomerAddresses",
        "location",
        Sequelize.DataTypes.GEOMETRY("GEOMETRY")
      );
    })
    .then(() => db.renameColumn("Companies", "position", "geoPosition"))
    .then(() => db.removeColumn("CustomerAddresses", "active"))
    .then(() =>
      db.addColumn("Customers", "activeAddressId", {
        type: "uuid"
      })
    );
};

exports.down = function(db) {
  return db
    .removeColumn("CustomerAddresses", "location")
    .then(() => db.renameColumn("Companies", "geoPosition", "position"))
    .then(() => {
      db.addColumn("CustomerAddresses", "active", {
        type: "boolean"
      });
    })
    .then(() => db.removeColumn("Customers", "activeAddressId"));
};

exports._meta = {
  version: 1
};
