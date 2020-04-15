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
  return db.createTable("CompanyReviews", {
      id: {
        type: "uuid",
        primaryKey: true,
        notNull: true,
        defaultValue: new String("uuid_generate_v4()")
      },
      title: { type: "string", allowNull: false },
      description: { type: "string", allowNull: true },
      companyId: { type: "uuid", allowNull: false },
      customerMark: { type: "integer", allowNull: false },
      customerId: { type: "uuid", allowNull: false }
    });
};

exports.down = function(db) {
  return db.dropTable("CompanyReviews");
};

exports._meta = {
  version: 1
};
