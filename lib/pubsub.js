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
        type: subject,
        userId: sourceDbName.split('/').pop(),
        me: targetDbName.split('/').pop(),
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
    var _replicatorDoc = replicatorDoc(task.pubsub.subject, task.pubsub.sourceDbName, task.pubsub.targetDbName);
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
    log('debug', task.pubsub.targetDbName + '->' + task.pubsub.sourceDbName);
    //console.log(task.pubsub.targetDbName + '->' + task.pubsub.sourceDbName);
    async.series([
      async.apply(replicator.add, task.pubsub.subject.join(','), subscribeId, _replicatorDoc),
      async.apply(pluginDb.add, task.pubsub.subject.join(','), pubSubDoc)
    ], cb);
  };

  var _removeSubscribe = function (task, cb) {
    log('_removeSubscribe', task);
    if (!task.pubsub.isSubscribed) {
      return cb('You are not subscribed.');
    }

    var subscribeId = pubsubId(task.pubsub.sourceDbName, task.pubsub.targetDbName);
    async.series([
      async.apply(replicator.remove, task.pubsub.subject.join(','), subscribeId),
      async.apply(pluginDb.remove, task.pubsub.subject.join(','), subscribeId)
    ], cb);
  };

  var _isSubscribed = function (task, cb) {
    log('_isSubscribed', task);
    var subscribeId = pubsubId(task.pubsub.sourceDbName, task.pubsub.targetDbName);
    pluginDb.find(task.pubsub.subject.join(','), subscribeId, function (err, _doc) {
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

  var _switchAttrs = function (task, cb) {
    var tmp = task.pubsub.sourceDbName;
    task.pubsub.sourceDbName = task.pubsub.targetDbName;
    task.pubsub.targetDbName = tmp;

    cb();
  };

  var _verifyAttrsArray = function (task, attr, cb) {
    if (!_.isArray(task[attr])) {
      return cb('the ' + attr + 'must be an array');
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

  PubSub.bidirectional = function (db, task, cb) {
    log('bidirectional', task);
    async.series([
        async.apply(PubSub.subscribe, db, task),
        async.apply(_switchAttrs, task),
        async.apply(_isSubscribed, task),
        async.apply(_dbExists, task),
        async.apply(_addSubscribe, task),
      ],
      utils.handleTask(hoodie, 'bidirectional', db, task, cb)
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

  PubSub.unbidirectional = function (db, task) {
    log('unbidirectional', task);
    async.series([
        async.apply(PubSub.unsubscribe, db, task),
        async.apply(_switchAttrs, task),
        async.apply(_isSubscribed, task),
        async.apply(_removeSubscribe, task),
      ],
      utils.handleTask(hoodie, 'unbidirectional', db, task)
    );
  };

  return PubSub;
};
