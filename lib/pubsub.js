var utils = require('./utils');

module.exports = function (hoodie) {
  var Replicator = require('./replicator')(hoodie);

  var PubSub = {
    dbName: 'plugins/hoodie-plugin-pubsub'
  };

  /**
   * Private
   */
  function _dbExists(sourceDbName, callback) {
    hoodie.request('HEAD', '/' + encodeURIComponent(sourceDbName), {}, function (err) {
      var dbExists = !err;
      callback(err, dbExists);
    });
  }

  function _addSubscribe(subject, sourceDbName, targetDbName, callback) {
    _dbExists(sourceDbName, function (err, dbExists) {
      if (!dbExists) {
        return callback('Source database not exists.');
      }

      var subscribeId = utils.pubsubId(sourceDbName, targetDbName);
      var _replicatorDoc = utils.replicatorDoc(subject, sourceDbName, targetDbName);

      Replicator.add(subject, subscribeId, _replicatorDoc, function (err, _doc, res) {
        if (err) return callback(err);

        var pubSubDoc = {
          id: subscribeId,
          source: sourceDbName,
          target: targetDbName
        };

        PubSub.db.add(subject, pubSubDoc, callback);
      });
    });
  }

  function _removeSubscribe(subject, sourceDbName, targetDbName, callback) {
    var subscribeId = utils.pubsubId(sourceDbName, targetDbName);

    Replicator.remove(subject, subscribeId, function (err, _doc, res) {
      if (err) return callback(err);

      PubSub.db.remove(subject, subscribeId, callback);
    });
  };

  /**
   * Public
   */
  PubSub.db = hoodie.database(PubSub.dbName);

  PubSub.addDb = function (callback) {
    hoodie.database.add(PubSub.dbName, callback);
  };

  PubSub.isSubscribed = function (subject, sourceDbName, targetDbName, callback) {
    var subscribeId = utils.pubsubId(sourceDbName, targetDbName);

    PubSub.db.find(subject, subscribeId, function (err, _doc) {
      var isSubscribed = !(err && err.error === 'not_found');
      callback(err, isSubscribed, _doc);
    });
  };

  PubSub.subscribe = function (subject, sourceDbName, targetDbName, callback) {
    PubSub.isSubscribed(subject, sourceDbName, targetDbName, function (err, isSubscribed, _doc) {
      console.log('isSubscribed:', isSubscribed);
      if (isSubscribed) {
        return callback('You already subscribed.', _doc);
      }

      _addSubscribe(subject, sourceDbName, targetDbName, callback);
    });
  };

  PubSub.unsubscribe = function (subject, sourceDbName, targetDbName, callback) {
    PubSub.isSubscribed(subject, sourceDbName, targetDbName, function (err, isSubscribed, _doc) {
      console.log('isSubscribed:', isSubscribed);
      if (!isSubscribed) {
        return callback('You are not subscribed.');
      }

      _removeSubscribe(subject, sourceDbName, targetDbName, callback);
    });
  };

  return PubSub;
};
