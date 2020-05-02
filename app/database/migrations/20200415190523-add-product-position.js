"use strict";

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
// eslint-disable-next-line no-undef
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

// eslint-disable-next-line no-undef
exports.up = function(db) {
  return db
    .addColumn("Products", "position", {
      type: "integer",
      allowNull: true,
      defaultValue: 0
    });
};

// eslint-disable-next-line no-undef
exports.down = function(db) {
  return db.removeColumn("Products", "position");
};

// eslint-disable-next-line no-undef
exports._meta = {
  version: 1
};
