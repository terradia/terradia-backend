"use strict";

let dbm;
let type;
let seed;
let oldValidated;

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
  db.runSql(
    `SELECT "public"."Users"."id", "public"."Users"."validated" from "public"."Users"`
  ).then(res => {
    oldValidated = res;
  });
  return db
    .runSql(
      `CREATE TYPE enum_users_status AS ENUM ('VALID', 'UNVALID', 'ARCHIVED');`
    )
    .then(() => db.removeColumn("Users", "validated"))
    .then(() => {
      return db.addColumn("Users", "status", {
        type: "enum_users_status",
        allowNull: false
      });
    })
    .then(() => {
      console.log(oldValidated);
    });
};

exports.down = function(db) {
  return db
    .removeColumn("Users", "status")
    .then(() => {
      return db.addColumn("Users", "validated", {
        type: "boolean",
        allowNull: true
      });
    })
    .then(() => {
      db.runSql("DROP TYPE IF EXISTS enum_users_status");
    });
};

exports._meta = {
  version: 1
};
