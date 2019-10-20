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
    .createTable("Categories", {
      id: {
        type: "uuid",
        primaryKey: true,
        notNull: true,
        defaultValue: new String("uuid_generate_v4()")
      },
      name: "string",
      parentCategoryId: "int"
    })
    .then(() => {
      db.runSql(
        `INSERT INTO public."Categories" ("name", "parentCategoryId") VALUES
                        ('FRESH', null),
                        ('ARTSNCRAFTS', null),
                        ('ALCOHOL', null),
                        ('MODERN', null)
                ;`
      ).catch(error => {
        throw new Error(error);
      });
    })
    .catch(error => {
      throw new Error(error);
    });
};

exports.down = function(db) {
  return db.dropTable("Categories");
};

exports._meta = {
  version: 1
};
