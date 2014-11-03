module.exports = function (hoodie, callback) {
  var Replicator = require('./replicator')(hoodie);

  var PubSub = {
    dbName: 'plugins/hoodie-plugin-pubsub'
  };

  PubSub.db = hoodie.database(PubSub.dbName);

  PubSub._id = function (sourceDbName, targetDbName) {
    return [sourceDbName, targetDbName].join('::');
  };

  PubSub.addDb = function (callback) {
    hoodie.database.add(PubSub.dbName, callback);
  };

  PubSub.isSubscribed = function (subject, sourceDbName, targetDbName, callback) {
    var subscribeId = PubSub._id(sourceDbName, targetDbName);

    PubSub.db.find(subject, subscribeId, function (err, doc) {
      var isSubscribed = !(err && err.error === 'not_found');
      callback(err, isSubscribed, doc);
    });
  };

  PubSub.dbExists = function (sourceDbName, callback) {
    hoodie.request('HEAD', '/' + encodeURIComponent(sourceDbName), {}, function (err) {
      var dbExists = !err;
      callback(err, dbExists);
    });
  };

  PubSub.addSubscribe = function (subject, sourceDbName, targetDbName, callback) {
    var subscribeId = PubSub._id(sourceDbName, targetDbName);
    var doc = {
      id: subscribeId,
      source: sourceDbName,
      target: targetDbName
    };

    PubSub.dbExists(sourceDbName, function (err, dbExists) {
      if (!dbExists) {
        return callback('Source database not exists.');
      }

      PubSub.db.add(subject, doc, function (err, doc) {
        var replicatorDoc = PubSub.replicatorDoc(subject, sourceDbName, targetDbName);
        Replicator.add(subject, subscribeId, replicatorDoc, callback);
      });
    });

  };

  PubSub.removeSubscribe = function (subject, sourceDbName, targetDbName, callback) {
    var subscribeId = PubSub._id(sourceDbName, targetDbName);
    PubSub.db.remove(subject, subscribeId, function (err, doc) {
      Replicator.remove(subject, subscribeId, callback);
    });
  };

  PubSub.replicatorDoc = function (subject, sourceDbName, targetDbName) {
    var subscribeId = subject + '/' + PubSub._id(sourceDbName, targetDbName);

    return {
      _id: subscribeId,
      source: sourceDbName,
      target: targetDbName,
      // filter: 'user/xpto/filter',
      user_ctx: {
        roles: [
           'hoodie:read:' + sourceDbName,
           'hoodie:write:' + targetDbName
        ]
      },
      continuous: true
    };
  };

  PubSub.subscribe = function (subject, sourceDbName, targetDbName, callback) {
    PubSub.isSubscribed(subject, sourceDbName, targetDbName, function (err, isSubscribed, _doc) {
      console.log('isSubscribed:', isSubscribed);
      if (isSubscribed) {
        return callback('You already subscribed.', _doc);
      }

      PubSub.addSubscribe(subject, sourceDbName, targetDbName, callback);
    });
  };

  PubSub.unsubscribe = function (subject, sourceDbName, targetDbName, callback) {
    PubSub.isSubscribed(subject, sourceDbName, targetDbName, function (err, isSubscribed, _doc) {
      console.log('isSubscribed:', isSubscribed);
      if (!isSubscribed) {
        return callback('You are not subscribed.', _doc);
      }

      PubSub.removeSubscribe(subject, sourceDbName, targetDbName, callback);
    });
  };

  return PubSub;
};
