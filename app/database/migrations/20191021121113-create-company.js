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
  return db.createTable("Companies", {
    id: {
      type: "uuid",
      primaryKey: true,
      notNull: true,
      defaultValue: new String("uuid_generate_v4()")
    },
    name: {
      type: "string",
      notNull: true
    },
    description: "string",
    email: "string",
    phone: "string",
    logo: "string",
    cover: "string",
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
  return db.dropTable("Companies");
};

exports._meta = {
  version: 1
};
