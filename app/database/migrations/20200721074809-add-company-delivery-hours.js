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
    .createTable("CompaniesDeliveryDaysHours", {
      id: {
        type: "uuid",
        primaryKey: true,
        notNull: true,
        defaultValue: new String("uuid_generate_v4()")
      },
      dayId: { type: "uuid", allowNull: false },
      startTime: { type: "datetime", allowNull: false },
      endTime: { type: "datetime", allowNull: false }
    })
    .then(() => {
      db.createTable("CompaniesDeliveryDays", {
        id: {
          type: "uuid",
          primaryKey: true,
          notNull: true,
          defaultValue: new String("uuid_generate_v4()")
        },
        companyId: { type: "uuid", allowNull: false },
        dayTranslationKey: { type: "string", allowNull: false },
        daySlugName: { type: "string", allowNull: false }
      });
    });
};

exports.down = function(db) {
  return db
    .dropTable("CompaniesDeliveryDays")
    .then(() => db.dropTable("CompaniesDeliveryDaysHours"));
};

exports._meta = {
  version: 1
};
