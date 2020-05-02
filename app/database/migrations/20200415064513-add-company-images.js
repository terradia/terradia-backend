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
    .createTable("CompanyImages", {
      id: {
        type: "uuid",
        primaryKey: true,
        notNull: true,
        defaultValue: new String("uuid_generate_v4()")
      },
      filename: {
        type: "string",
        allowNull: false
      },
      companyId: {
        type: "uuid",
        allowNull: true
      },
      logoId: {
        type: "uuid",
        allowNull: true
      },
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
  return db.dropTable("CompanyImages");
};

exports._meta = {
  version: 1
};
