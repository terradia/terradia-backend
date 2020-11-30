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
    .addColumn("CartProducts", "createdAt", {
      notNull: true,
      type: new String("TIMESTAMPTZ"),
      defaultValue: new String("now()")
    })
    .then(() => {
      return db.addColumn("CartProducts", "updatedAt", {
        notNull: true,
        type: new String("TIMESTAMPTZ"),
        defaultValue: new String("now()")
      });
    });
};

exports.down = function(db) {
  return db
    .removeColumn("CartProducts", "updatedAt")
    .then(() => db.removeColumn("CartProducts", "createdAt"));
};

exports._meta = {
  version: 1
};
