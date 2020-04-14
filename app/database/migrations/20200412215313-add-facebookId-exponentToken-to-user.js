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
  db.addColumn("Users", "facebookId", {
    type: "string"
  });
  db.changeColumn("Users", "password", {allowNull: true});
  return db.addColumn("Users", "exponentPushToken", {
    type: "string"
  });
};

exports.down = function(db) {
  db.removeColumn("Users", "facebookId");
  db.changeColumn("Users", "password", {allowNull: false});
  return db.removeColumn("Users", "exponentPushToken");
};

exports._meta = {
  version: 1
};
