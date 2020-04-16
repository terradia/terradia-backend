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
    .addColumn("Companies", "averageMark", {
      type: "float",
      allowNull: true,
      defaultValue: 0
    })
    .then(() => {
      db.addColumn("Companies", "numberOfMarks", {
        type: "integer",
        allowNull: true,
        defaultValue: 0
      });
    });
};

exports.down = function(db) {
  return db.removeColumn("Companies", "averageMark").then(() => {
    db.removeColumn("Companies", "numberOfMarks");
  });
};

exports._meta = {
  version: 1
};
