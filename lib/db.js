var async = require('async'),
    utils = require('hoodie-utils-plugins')('pubsub:db'),
    ExtendedDatabaseAPI = utils.ExtendedDatabaseAPI;

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
      return (
        ((!!req.query.type && !!doc.type) && (doc.type === req.query.type)) &&
        ((!doc.exclusive)) ||
        (
          (!!req.query.exclusive && !!doc.exclusive) && (
            doc.exclusive
              .map(function (v) {
                return req.query.exclusive.indexOf(v) >= 0;
              })
              .reduce(function (a, c) {
                return a && c;
              })
          ))
        );
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
        if (doc.source && !doc.exclusive) {
          emit(doc.source, doc._id);
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
        if (doc.target && !doc.exclusive) {
          emit(doc.target, doc._id);
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
