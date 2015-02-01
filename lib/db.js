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
              ((!!req.query.userId && !!doc.userId) && (req.query.userId === doc.userId)) &&
              ((!!req.query.type && !!doc.type) && (
                req.query.type
                  .map(function (v) {
                    return (doc.type === v);
                  })
                  .reduce(function (b, c) {
                    return (b || c);
                  }, false)
              )) &&
              (
                (!doc.exclusive) ||
                ((!!req.query.me) && (
                    doc.exclusive
                    .map(function (v) {
                      return (req.query.me === v);
                    })
                    .reduce(function (b, c) {
                      return (b || c);
                    }, false)
                ))
              )
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
        if (doc.source && doc.target && doc.subject) {
          var subject = doc.subject.join(',');
          emit([doc.source, subject], { userId: doc.target.split('/').pop(), subject: subject });
        }
      },
      reduce: function (key, value, rereduce) {
        if (!rereduce)
          return value;
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
        if (doc.target && doc.source && doc.subject) {
          var subject = doc.subject.join(',');
          emit([doc.target, subject], { userId: doc.source.split('/').pop(), subject: subject });
        }
      },
      reduce: function (key, value, rereduce) {
        if (!rereduce)
          return value;
      }
    };

    db.addIndex('by_subscriptions', index, function (err) {
      if (err) {
        return callback(err);
      }

      return callback();
    });
  };

  /**
   * PubSub addIndexSubscribersByType
   */

  var addIndexSubscribersByType = function (hoodie, db, callback) {

    var index = {
      map: function (doc) {
        if (doc.source && doc.target && doc.subject) {
          emit(doc.subject.join(','), doc.target.split('/').pop());
        }
      },
      reduce: function (key, value, rereduce) {
        if (!rereduce)
          return value;
      }
    };

    db.addIndex('by_subscribersType', index, function (err) {
      if (err) {
        return callback(err);
      }

      return callback();
    });
  };

 /**
   * PubSub addIndexSubscriptionsByType
   */

  var addIndexSubscriptionsByType = function (hoodie, db, callback) {

    var index = {
      map: function (doc) {
        if (doc.target && doc.source && doc.subject) {
          emit(doc.subject.join(','), doc.source.split('/').pop());
        }
      },
      reduce: function (key, value, rereduce) {
        if (!rereduce)
          return value;
      }
    };

    db.addIndex('by_subscriptionsType', index, function (err) {
      if (err) {
        return callback(err);
      }

      return callback();
    });
  };



  async.series([
    async.apply(dbAdd, hoodie),
    async.apply(addIndexSubscribers, hoodie, db),
    async.apply(addIndexSubscribersByType, hoodie, db),
    async.apply(addIndexSubscriptions, hoodie, db),
    async.apply(addIndexSubscriptionsByType, hoodie, db),
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
