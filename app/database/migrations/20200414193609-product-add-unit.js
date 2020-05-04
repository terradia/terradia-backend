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
    .addColumn("Products", "unitId", {
      type: "uuid",
      allowNull: true
    })
    .then(() => {
      return db.addColumn("Products", "price", {
        type: "float",
        allowNull: false
      });
    })
    .then(() => {
      return db.addColumn("Products", "quantityForUnit", {
        type: "integer",
        allowNull: true
      });
    });
};

exports.down = function(db) {
  return db
    .removeColumn("Products", "unitId")
    .then(() => db.removeColumn("Products", "price"))
    .then(() => db.removeColumn("Products", "quantityForUnit"));
};

exports._meta = {
  version: 1
};
