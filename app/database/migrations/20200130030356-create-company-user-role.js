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
  return db.createTable("CompanyUserRoles", {
    id: {
      type: "uuid",
      primaryKey: true,
      notNull: true,
      defaultValue: new String("uuid_generate_v4()")
    },
    companyUserId: { type: "uuid", allowNull: false },
    roleId: { type: "uuid", allowNull: false }
  });
};

exports.down = function(db) {
  return db.dropTable("CompanyUserRoles");
};

exports._meta = {
  "version": 1
};
