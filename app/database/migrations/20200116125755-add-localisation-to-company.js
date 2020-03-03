"use strict";

const Sequelize = require("sequelize");

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

// Be sure that PostGIS is installed on the Computer / Server so that PostGreSQL is able to find the extension.
exports.up = function(db) {
  return db
    .runSql("CREATE EXTENSION IF NOT EXISTS postgis;")
    .then(() => {
      db.addColumn(
        "Companies",
        "position",
        Sequelize.DataTypes.GEOMETRY("GEOMETRY")
      );
    })
    .then(() => {
      db.addColumn("Companies", "address", {
        type: "string",
        allowNull: false
      });
    });
};

exports.down = function(db) {
  db.removeColumn("Companies", "position");
  return db.removeColumn("Companies", "address");
};

exports._meta = {
  version: 1
};
