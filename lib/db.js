var async = require('async');
var ExtendedDatabaseAPI = require('hoodie-utils-plugins').ExtendedDatabaseAPI;

module.exports = function (hoodie, dbname) {

  /**
   * PubSub _dbname
   */

  var db = new ExtendedDatabaseAPI(hoodie, hoodie.database(dbname));

  /**
   * PubSub dbAdd
   */

  var dbAdd = function (hoodie, callback) {
    hoodie.database.add(dbname, function (err) {
      callback(err);
    });
  };

  /**
   * PubSub userFilter
   */

  db.userFilter = function (hoodie, db, callback) {
    var filterFunction = function (doc, req) {
      if (doc.type === req.query.type) {
        return true;
      } else {
        return false;
      }
    };

    db.addFilter('by_type', filterFunction, function (err) {
      if (err) {
        return callback(err);
      }

      return callback();
    });
  };


  /**
   * PubSub addIndexSubscribers
   */

  var addIndexSubscribers = function (hoodie, db, callback) {

    var index = {
      map: function (doc) {
        if (doc.target) {
          emit(doc.target, doc._id);
        }
      }
    };

    db.addIndex('by_subscribers', index, function (err) {
      if (err) {
        return callback(err);
      }

      return callback();
    });
  };

  /**
   * PubSub addIndexSubscribers
   */

  var addIndexSubscriptions = function (hoodie, db, callback) {

    var index = {
      map: function (doc) {
        if (doc.source) {
          emit(doc.source, doc._id);
        }
      }
    };

    db.addIndex('by_subscriptions', index, function (err) {
      if (err) {
        return callback(err);
      }

      return callback();
    });
  };

  async.series([
    async.apply(dbAdd, hoodie),
    async.apply(addIndexSubscribers, hoodie, db),
    async.apply(addIndexSubscriptions, hoodie, db),
  ],
  function (err) {
    if (err) {
      console.error(
        'setup db error() error:\n' + (err.stack || err.message || err.toString())
      );
    }
  });

  return db;
};
