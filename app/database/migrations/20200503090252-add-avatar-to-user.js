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
  return db.addColumn("Users", "avatar", {
    type: "string",
    allowNull: true
  });
};

exports.down = function(db) {
  return db.removeColumn("Users", "avatar");
};

exports._meta = {
  version: 1
};
