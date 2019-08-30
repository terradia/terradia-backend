"use strict";
const Sequelize = require("sequelize");

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

exports.up = db =>
  db.runSql('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";').then(() =>
    db.createTable("Users", {
      id: {
        type: "uuid",
        primaryKey: true,
        notNull: true,
        defaultValue: new String("uuid_generate_v4()")
      },
      firstName: { type: "string" },
      lastName: { type: "string" },
      email: { type: "string", unique: true },
      password: { type: "string", allowNull: false },
      phone: { type: "string", allowNull: false, unique: true },
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
    })
  );

exports.down = function(db) {
  return db.dropTable("Users");
};

exports._meta = {
  version: 1
};
