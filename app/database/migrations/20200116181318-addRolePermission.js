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
  return db.createTable("RoleCompany", {
    id: {
      type: "int",
      primaryKey: true,
      autoIncrement: true,
      notNull: true,
      unsigned: true
    },
    userId: {
      type: "uuid",
      notNull: true
    },
    companyId: {
      type: "uuid",
      notNull: true
    },
    role: {
      type: "string",
      notNull: true
    }
  });
};

exports.down = function(db) {
  return db.dropTable("RoleCompany");
};

exports._meta = {
  version: 1
};
