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
  db.addColumn("Products", "companyProductsCategoryId", {
    type: "uuid",
    allowNull: true
  });
  return db.createTable("CompanyProductsCategories", {
    id: {
      type: "uuid",
      primaryKey: true,
      notNull: true,
      defaultValue: new String("uuid_generate_v4()")
    },
    name: { type: "string", allowNull: false },
    companyId: { type: "uuid", allowNull: false }
  });
};

exports.down = function(db) {
  db.removeColumn("Products", "companyProductsCategoryId");
  return db.dropTable("CompanyProductsCategories");
};

exports._meta = {
  "version": 1
};
