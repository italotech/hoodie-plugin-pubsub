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


  var replicatorDoc = function (subject, sourceDbName, targetDbName, exclusive) {
    var subscribeId = subject + '/' + pubsubId(sourceDbName, targetDbName);

    return {
      _id: subscribeId,
      source: sourceDbName,
      target: targetDbName,
      filter: 'filters/by_type',
      query_params: {
        type: subject,
        exclusive: (exclusive) ? [targetDbName.split('/').pop(), sourceDbName.split('/').pop()]: null,
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
    hoodie.request('HEAD', '/' + encodeURIComponent(task.pubsub.sourceDbName), {}, function (err, _doc) {
      task.pubsub.dbExists = !!_doc;
      cb(null, task);
    });
  };

  var _addSubscribe =  function (task, cb) {
    log('_addSubscribe', task);
    if (task.pubsub.dbExists) {
      return cb('Source database not exists.');
    }

    if (task.pubsub.isSubscribed) {
      return cb('You already subscribed.');
    }

    var subscribeId = pubsubId(task.pubsub.sourceDbName, task.pubsub.targetDbName);
    var _replicatorDoc = replicatorDoc(task.pubsub.subject, task.pubsub.sourceDbName, task.pubsub.targetDbName, task.pubsub.exclusive);
    var pubSubDoc = _.omit(task.pubsub, [
      'id',
      'type',
      '_rev',
      'sourceDbName',
      'targetDbName',
      'dbExists',
      'isSubscribed'
    ]);
    pubSubDoc.id = subscribeId;
    pubSubDoc.source = task.pubsub.sourceDbName;
    pubSubDoc.target = task.pubsub.targetDbName;

    async.series([
      async.apply(replicator.add, task.pubsub.subject, subscribeId, _replicatorDoc),
      async.apply(pluginDb.add, task.pubsub.subject, pubSubDoc)
    ], cb);
  };

  var _removeSubscribe = function (task, cb) {
    log('_removeSubscribe', task);
    if (!task.pubsub.isSubscribed) {
      return cb('You are not subscribed.');
    }

    var subscribeId = pubsubId(task.pubsub.sourceDbName, task.pubsub.targetDbName);
    async.series([
      async.apply(replicator.remove, task.pubsub.subject, subscribeId),
      async.apply(pluginDb.remove, task.pubsub.subject, subscribeId)
    ], cb);
  };

  var _isSubscribed = function (task, cb) {
    log('_isSubscribed', task);
    var subscribeId = pubsubId(task.pubsub.sourceDbName, task.pubsub.targetDbName);
    pluginDb.find(task.pubsub.subject, subscribeId, function (err, _doc) {
      task.pubsub.isSubscribed = !!_doc;
      cb(null, task);
    });
  };

  var _verifyAttrs = function (task, attr, cb) {
    log('_verifyAttrs', task);
    if (!attr || !task[attr]) {
      return cb('Pls, fill the param: ' + attr);
    }
    cb();
  };

  var _setAttrs = function (task, db, cb) {
    task.pubsub.sourceDbName = 'user/' + task.pubsub.userId;
    task.pubsub.targetDbName = db;

    cb();
  };

  var _verifyAttrsArray = function (task, attr, cb) {
    if (!_.isArray(task[attr])) {
      return cb();//'the ' + attr + 'must be an array');
    }
    cb();
  };

  PubSub.subscribe = function (db, task, cb) {
    log('subscribe', task);
    async.series([
        async.apply(_verifyAttrs, task, 'pubsub'),
        async.apply(_verifyAttrs, task.pubsub, 'userId'),
        async.apply(_verifyAttrs, task.pubsub, 'subject'),
        async.apply(_verifyAttrsArray, task.pubsub, 'subject'),
        async.apply(_setAttrs, task, db),
        async.apply(_isSubscribed, task),
        async.apply(_dbExists, task),
        async.apply(_addSubscribe, task)
      ],
      utils.handleTask(hoodie, 'subscribe', db, task, cb)
    );
  };

  PubSub.unsubscribe = function (db, task) {
    log('unsubscribe', task);
    async.series([
        async.apply(_verifyAttrs, task, 'pubsub'),
        async.apply(_verifyAttrs, task.pubsub, 'userId'),
        async.apply(_verifyAttrs, task.pubsub, 'subject'),
        async.apply(_verifyAttrsArray, task.pubsub, 'subject'),
        async.apply(_setAttrs, task, db),
        async.apply(_isSubscribed, task),
        async.apply(_removeSubscribe, task)
      ],
      utils.handleTask(hoodie, 'unsubscribe', db, task)
    );
  };

  return PubSub;
};
