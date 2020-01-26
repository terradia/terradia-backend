'use strict';

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
  return db.createTable("CustomerAddresses", {
    id: {
      type: "uuid",
      primaryKey: true,
      notNull: true,
      defaultValue: new String("uuid_generate_v4()")
    },
    address: { type: "string", allowNull: false },
    apartment: { type: "string", allowNull: true },
    information: { type: "string", allowNull: true },
    active: {type: "boolean", allowNull: false, defaultValue: true},
    customerId: { type: "uuid", allowNull: false }
  });
};

exports.down = function(db) {
  return db.dropTable("CustomerAddresses");
};

exports._meta = {
  "version": 1
};
