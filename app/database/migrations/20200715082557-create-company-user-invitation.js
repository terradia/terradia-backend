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
  return db
    .runSql(
      `CREATE TYPE enum_companiesusersinvitations_status AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');`
    )
    .then(() => {
      db.createTable("CompaniesUsersInvitations", {
        id: {
          type: "uuid",
          primaryKey: true,
          notNull: true,
          defaultValue: new String("uuid_generate_v4()")
        },
        invitationEmail: { type: "string", allowNull: false },
        fromUserId: { type: "uuid", allowNull: false },
        companyId: { type: "uuid", allowNull: false },
        status: {
          type: "enum_companiesusersinvitations_status",
          defaultValue: "PENDING"
        },
        createdAt: {
          notNull: true,
          type: new String("TIMESTAMPTZ"),
          defaultValue: new String("now()")
        },
        updatedAt: {
          notNull: true,
          type: new String("TIMESTAMPTZ"),
          defaultValue: new String("now()")
        }
      });
    });
};

exports.down = function(db) {
  return db.dropTable("CompaniesUsersInvitations").then(() => {
    return db.runSql(
      'DROP TYPE IF EXISTS "enum_companiesusersinvitations_status";'
    );
  });
};

exports._meta = {
  version: 1
};
