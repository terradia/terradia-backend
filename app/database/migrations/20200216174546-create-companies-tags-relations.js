"use strict";

let dbm;
let type;
let seed;

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
  return db.createTable("CompaniesTagsRelations", {
    id: {
      type: "uuid",
      primaryKey: true,
      notNull: true,
      defaultValue: new String("uuid_generate_v4()")
    },
    companyId: {
      type: "uuid",
      allowNull: false
    },
    tagId: {
      type: "uuid",
      allowNull: false
    }
  });
};

exports.down = function(db) {
  return db.dropTable("CompaniesTagsRelations");
};

exports._meta = {
  version: 1
};
