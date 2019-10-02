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

/**
 * Miss props: compagny: compagny  /  image / type: productType / role: role / comments: comments / tutorial: tutorial[] / awards: awards
 */

exports.up = db =>
  db.runSql('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";').then(() =>
    db.createTable("Products", {
      name: { type: "string", allowNull: false },
      description: { type: "string", allowNull: false },
      category: { type: "string", allowNull: false },
      price: { type: "number", allowNull: false },
      quantity: { type: "number", allowNull: false },
      weight: { type: "number", allowNull: false },
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
  return db.dropTable("Products");
};

exports._meta = {
  version: 1
};
