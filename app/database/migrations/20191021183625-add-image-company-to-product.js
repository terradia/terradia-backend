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
  db.addColumn("Products", "companyId", {
    type: "uuid",
    notNull: true
  });
  return db.addColumn("Products", "image", {
    type: "string"
  });
};

exports.down = function(db) {
  db.removeColumn("Products", "companyId");
  return db.removeColumn("Products", "image");
};

exports._meta = {
  version: 1
};
