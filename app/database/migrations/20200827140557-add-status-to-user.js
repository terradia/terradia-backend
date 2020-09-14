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
  return db.addColumn("Users", "archivedAt", {
    type: new String("TIMESTAMPTZ"),
    allowNull: true
  });
};

exports.down = function(db) {
  return db.removeColumn("Users", "archivedAt");
};

/*exports.up = function(db) {
  return db
    .runSql(
      `CREATE TYPE enum_users_status AS ENUM ('VALID', 'UNVALID', 'ARCHIVED');`
    )
    .then(() => {
      return db.addColumn("Users", "status", {
        type: "enum_users_status",
        allowNull: false
      });
    })
    .then(() => {
      db.runSql(
        `UPDATE "public"."Users" SET status = 'VALID' WHERE "public"."Users"."validated" = '1';`
      );
    })
    .then(() =>
      db.runSql(
        `UPDATE "public"."Users" SET status = 'UNVALID' WHERE "public"."Users"."validated" = '0';`
      )
    )
    .then(() => db.removeColumn("Users", "validated"));
};

exports.down = function(db) {
  return db
    .addColumn("Users", "validated", {
      type: "boolean",
      allowNull: true
    })
    .then(() =>
      db.runSql(
        `UPDATE "public"."Users" SET validated = '1' WHERE "public"."Users"."status" = 'VALID';`
      )
    )
    .then(
      () =>
        `UPDATE "public"."Users" SET validated = '0' WHERE "public"."Users"."status" = 'UNVALID';`
    )
    .then(
      () =>
        `UPDATE "public"."Users" SET validated = '0' WHERE "public"."Users"."status" = 'ARCHIVED';`
    )
    .then(() => db.removeColumn("Users", "status"))
    .then(() => {
      db.runSql("DROP TYPE IF EXISTS enum_users_status");
    });
};*/

exports._meta = {
  version: 1
};
