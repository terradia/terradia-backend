"use strict";

let dbm;
let type;
let seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
// eslint-disable-next-line no-undef
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

// eslint-disable-next-line no-undef
exports.up = function(db) {
  return db
    .createTable("CompaniesOpeningDaysHours", {
      id: {
        type: "uuid",
        primaryKey: true,
        notNull: true,
        defaultValue: new String("uuid_generate_v4()")
      },
      dayId: { type: "uuid", allowNull: false },
      startTime: { type: "date", allowNull: false },
      endTime: { type: "date", allowNull: false }
    })
    .then(() => {
      db.createTable("CompaniesOpeningDays", {
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

// eslint-disable-next-line no-undef
exports.down = function(db) {
  return db
    .dropTable("CompaniesOpeningDays")
    .then(() => db.dropTable("CompaniesOpeningDaysHours"));
};

// eslint-disable-next-line no-undef
exports._meta = {
  version: 1
};
