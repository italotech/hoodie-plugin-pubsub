/**
 * Dependencies
 */

var utils = require('./utils');
var async = require('async');

module.exports = function (hoodie, pluginDb) {
  var Network = this;


  var queryBySubscribers = function (task, cb) {
    return pluginDb.query('by_subscribers', { key: 'user/' + task.userId }, function (err, rows) {
      if (err) return cb(err);
      task.subscribers = rows;
      cb();
    });
  };

  var queryBySubscriptions = function (task, cb) {
    return pluginDb.query('by_subscriptions', { key: 'user/' + task.userId }, function (err, rows) {
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
