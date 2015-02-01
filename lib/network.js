/**
 * Dependencies
 */

var utils = require('hoodie-utils-plugins')('pubsub:network');
var log = utils.debug();
var async = require('async');

module.exports = function (hoodie, pluginDb) {
  var Network = this;


  var _verifyAttrs = function (task, attr, cb) {
    log('_verifyAttrs', task);
    if (!attr || !task[attr]) {
      return cb('Pls, fill the param: ' + attr);
    }
    cb();
  };

  var queryBySubscribers = function (task, cb) {
    log('queryBySubscribers', task);
    var key = ['user/' + task.pubsub.userId];
    if (task.pubsub.type)
      key.push(task.pubsub.type.join(','));
    return pluginDb.group('by_subscribers', key, 1, function (err, rows) {
      if (err) return cb(err);
      task.pubsub.subscribers = rows;
      cb();
    });
  };

  var queryBySubscriptions = function (task, cb) {
    log('queryBySubscriptions', task);
    var key = ['user/' + task.pubsub.userId];
    if (task.pubsub.type)
      key.push(task.pubsub.type.join(','));
    return pluginDb.group('by_subscriptions', key, 1, function (err, rows) {
      if (err) return cb(err);
      task.pubsub.subscriptions = rows;
      cb();
    });
  };

  Network.subscribers = function (db, task) {
    log('subscribers', task);
    async.series([
        async.apply(_verifyAttrs, task, 'pubsub'),
        async.apply(_verifyAttrs, task.pubsub, 'userId'),
        async.apply(queryBySubscribers, task),
      ],
      utils.handleTask(hoodie, 'subscribers', db, task)
    );
  };

  Network.subscriptions = function (db, task) {
    log('subscriptions', task);
    async.series([
        async.apply(_verifyAttrs, task, 'pubsub'),
        async.apply(_verifyAttrs, task.pubsub, 'userId'),
        async.apply(queryBySubscriptions, task),
      ],
      utils.handleTask(hoodie, 'subscriptions', db, task)
    );
  };

  return Network;
};
