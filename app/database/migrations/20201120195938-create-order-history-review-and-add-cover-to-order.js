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
    .createTable("OrdersHistoryReviews", {
      id: {
        type: "uuid",
        primaryKey: true,
        notNull: true,
        defaultValue: new String("uuid_generate_v4()")
      },
      orderHistoryId: {
        type: "uuid",
        allowNull: false
      },
      comment: { type: "string", allowNull: true },
      customerMark: { type: "integer", allowNull: false },
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
    .then(() =>
      db.addColumn("OrdersHistory", "companyCover", {
        type: "string",
        allowNull: true
      })
    );
};

exports.down = function(db) {
  db.removeColumn("OrdersHistory", "companyCover");
  return db.dropTable("OrdersHistoryReviews");
};

exports._meta = {
  version: 1
};
