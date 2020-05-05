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
  return db
    .createTable("CompanyTags", {
      id: {
        type: "uuid",
        primaryKey: true,
        notNull: true,
        defaultValue: new String("uuid_generate_v4()")
      },
      slugName: { type: "string", allowNull: false },
      translationKey: { type: "string", allowNull: false },
      color: { type: "string", allowNull: false }
    })
    .catch(error => {
      throw new Error(error);
    });
};

exports.down = function(db) {
  return db.dropTable("CompanyTags");
};

exports._meta = {
  version: 1
};
