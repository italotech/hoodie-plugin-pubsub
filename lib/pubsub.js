var utils = require('./utils'),
    Replicator = require('./replicator'),
    async = require('async');

module.exports = function (hoodie, pluginDb) {
  var replicator = new Replicator(hoodie);

  /**
   * Private
   */
  var _dbExists = function (task, cb) {

    hoodie.request('HEAD', '/' + encodeURIComponent(task.sourceDbName), {}, function (err) {
      task.dbExists = !err;
      cb((!!err) ? 'Source database not exists.' : err, task);
    });
  }

  var _addSubscribe =  function (task, cb) {

    if (task.isSubscribed) {
      return cb('you allready subscribed');
    }
    var subscribeId = utils.pubsubId(task.sourceDbName, task.targetDbName);
    var replicatorDoc = utils.replicatorDoc(task.subject, task.sourceDbName, task.targetDbName);
    var pubSubDoc = {
      id: subscribeId,
      source: task.sourceDbName,
      target: task.targetDbName
    };

    async.series([
      async.apply(replicator.add, task.subject, subscribeId, replicatorDoc),
      async.apply(pluginDb.add, pubSubDoc)
    ], cb);

  }

  var _removeSubscribe = function (task, cb) {
    if (!task.isSubscribed) {
      return cb('you are not subscribed');
    }
    var subscribeId = utils.pubsubId(task.sourceDbName, task.targetDbName);
    async.series([
      async.apply(replicator.remove, task.subject, subscribeId),
      async.apply(pluginDb.remove, task.subject, subscribeId)
    ], cb);

  };

  var _isSubscribed = function (task, cb) {

    var subscribeId = utils.pubsubId(task.sourceDbName, task.targetDbName);

    pluginDb.find(task.subject, subscribeId, function (err, _doc) {
      task.isSubscribed = !(err && err.error === 'not_found');
      cb((!task.isSubscribed) ? null : err, task);
    });
  };

  var _setAttrs = function(task, db, cb) {
    task.sourceDbName = 'user/' + task.userId;
    task.targetDbName = db;

    if (!task.userId || !task.subject) {
      return hoodie.task.error(db, task, 'Pls, fill the params: userId and subject');
    }
    cb();
  }
  /**
   * Public
   */
  var PubSub = {};

  PubSub.subscribe = function (db, task) {


    async.series([
      async.apply(_setAttrs, task, db),
      async.apply(_isSubscribed, task),
      async.apply(_dbExists, task),
      async.apply(_addSubscribe, task)
      ],
      utils.handleTask(hoodie, 'subscribe', db, task));

  };

  PubSub.unsubscribe = function (db, task) {

    async.series([
      async.apply(_setAttrs, task, db),
      async.apply(_isSubscribed, task),
      async.apply(_removeSubscribe, task)
      ],
      utils.handleTask(hoodie, 'unsubscribe', db, task));

  };

  return PubSub;
};
