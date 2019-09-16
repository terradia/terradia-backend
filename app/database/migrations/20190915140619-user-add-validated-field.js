'use strict';
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

exports.up = function(db) {
  return db.addColumn("Users", "validated", { type: "boolean" });
};

exports.down = function(db) {
  return db.removeColumn("Users", "validated");
};

exports._meta = {
  "version": 1
};
