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
  db.removeColumn("Users", "companyId");
  return db.createTable("CompanyUsers", {
    id: {
      type: "uuid",
      primaryKey: true,
      notNull: true,
      defaultValue: new String("uuid_generate_v4()")
    },
    companyId: { type: "uuid", allowNull: false },
    userId: { type: "uuid", allowNull: false }
  });
};

exports.down = function(db) {
  db.addColumn("Users", "companyId", {
    type: "uuid",
    allowNull: true
  });
  return db.dropTable("CompanyUsers");
};

exports._meta = {
  "version": 1
};
