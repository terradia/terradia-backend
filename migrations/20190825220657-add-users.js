'use strict';

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

exports.up = function(db, callback) {
  db.createTable(
      'user',
      {
        id: { type: 'int', primaryKey: true, autoIncrement: true },
        createdAt: 'bigint',
        updatedAt: 'bigint',
        firstName: 'string',
        lastName: 'string',
        password: { type: 'string', allowNull: false},
        email: { type: 'string', allowNull: false, unique: true},
        phone: { type: 'int', allowNull: true, unique: true}
      },
      callback
  )
};

exports.down = function(db, callback) {
  db.dropTable('user', callback)
};

exports._meta = {
  "version": 1
};
