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
  return db.createTable("Units", {
    id: {
      type: "uuid",
      primaryKey: true,
      notNull: true,
      defaultValue: new String("uuid_generate_v4()")
    },
    name: {
      type: "string",
      allowNull: false
    },
    notation: {
      type: "string",
      allowNull: false
    },
    referenceUnitId: {
      type: "uuid",
      allowNull: true
    },
    multiplicationFactor: {
      type: "float",
      allowNull: true
    }
  });
};

exports.down = function(db) {
  return db.dropTable("Units");
};

exports._meta = {
  "version": 1
};
