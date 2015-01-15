/**
 * Dependencies
 */

var utils = require('hoodie-utils-plugins')('pubsub:pubsub');
var log = utils.debug();
var Replicator = utils.ReplicatorAPI;
var async = require('async');
var _ = require('lodash');

module.exports = function (hoodie, pluginDb) {
  var PubSub = this;

  var replicator = new Replicator(hoodie);

  var pubsubId = function (sourceDbName, targetDbName) {
    return [sourceDbName, targetDbName].join('::');
  };


  var replicatorDoc = function (subject, sourceDbName, targetDbName) {
    var subscribeId = subject + '/' + pubsubId(sourceDbName, targetDbName);

    return {
      _id: subscribeId,
      source: sourceDbName,
      target: targetDbName,
      filter: 'filters/by_type',
      query_params: {
        type: subject
      },
      user_ctx: {
        roles: [
          'hoodie:read:' + sourceDbName,
          'hoodie:write:' + targetDbName
        ]
      },
      continuous: true
    };
  };

  var _dbExists = function (task, cb) {
    log('_dbExists', task);
    hoodie.request('HEAD', '/' + encodeURIComponent(task.sourceDbName), {}, function (err, _doc) {
      task.dbExists = !!_doc;
      cb(null, task);
    });
  };

  var _addSubscribe =  function (task, cb) {
    log('_addSubscribe', task);
    if (task.dbExists) {
      return cb('Source database not exists.');
    }

    if (task.isSubscribed) {
      return cb('You already subscribed.');
    }

    var subscribeId = pubsubId(task.sourceDbName, task.targetDbName);
    var _replicatorDoc = replicatorDoc(task.subject, task.sourceDbName, task.targetDbName);
    var pubSubDoc = _.omit(task, [
      'id',
      'type',
      '_rev',
      'sourceDbName',
      'targetDbName',
      'dbExists',
      'isSubscribed'
    ]);
    pubSubDoc.id = subscribeId;
    pubSubDoc.source = task.sourceDbName;
    pubSubDoc.target = task.targetDbName;

    async.series([
      async.apply(replicator.add, task.subject, subscribeId, _replicatorDoc),
      async.apply(pluginDb.add, task.subject, pubSubDoc)
    ], cb);
  };

  var _removeSubscribe = function (task, cb) {
    log('_removeSubscribe', task);
    if (!task.isSubscribed) {
      return cb('You are not subscribed.');
    }

    var subscribeId = pubsubId(task.sourceDbName, task.targetDbName);
    async.series([
      async.apply(replicator.remove, task.subject, subscribeId),
      async.apply(pluginDb.remove, task.subject, subscribeId)
    ], cb);
  };

  var _isSubscribed = function (task, cb) {
    log('_isSubscribed', task);
    var subscribeId = pubsubId(task.sourceDbName, task.targetDbName);
    pluginDb.find(task.subject, subscribeId, function (err, _doc) {
      task.isSubscribed = !!_doc;
      cb(null, task);
    });
  };

  var _setAttrs = function (task, db, cb) {
    task.sourceDbName = 'user/' + task.userId;
    task.targetDbName = db;

    if (!task.userId || !task.subject) {
      return hoodie.task.error(db, task, 'Pls, fill the params: userId and subject');
    }
    cb();
  };

  PubSub.subscribe = function (db, task) {
    log('subscribe', task);
    async.series([
        async.apply(_setAttrs, task, db),
        async.apply(_isSubscribed, task),
        async.apply(_dbExists, task),
        async.apply(_addSubscribe, task)
      ],
      utils.handleTask(hoodie, 'subscribe', db, task)
    );
  };

  PubSub.unsubscribe = function (db, task) {
    log('unsubscribe', task);
    async.series([
        async.apply(_setAttrs, task, db),
        async.apply(_isSubscribed, task),
        async.apply(_removeSubscribe, task)
      ],
      utils.handleTask(hoodie, 'unsubscribe', db, task)
    );
  };

  return PubSub;
};
