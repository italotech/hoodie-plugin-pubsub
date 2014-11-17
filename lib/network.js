/**
 * Dependencies
 */

var utils = require('hoodie-utils-plugins');
var async = require('async');

module.exports = function (hoodie, pluginDb) {
  var Network = this;


  var queryBySubscribers = function (task, cb) {
    return pluginDb.query('by_subscribers', { include_docs: true, key: 'user/' + task.userId }, function (err, rows) {
      if (err) return cb(err);
      task.subscribers = rows;
      cb();
    });
  };

  var queryBySubscriptions = function (task, cb) {
    return pluginDb.query('by_subscriptions', { include_docs: true, key: 'user/' + task.userId }, function (err, rows) {
      if (err) return cb(err);
      task.subscriptions = rows;
      cb();
    });
  };

  Network.subscribers = function (db, task) {
    async.series([
        async.apply(queryBySubscribers, task),
      ],
      utils.handleTask(hoodie, 'subscribers', db, task)
    );
  };

  Network.subscriptions = function (db, task) {
    async.series([
        async.apply(queryBySubscriptions, task),
      ],
      utils.handleTask(hoodie, 'subscriptions', db, task)
    );
  };

  return Network;
};
