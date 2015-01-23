/**
 * Hoodie plugin pubsub
 * Lightweight and easy pubsub
 */

/**
 * Dependencies
 */
var PubSub = require('./lib');

/**
 * PubSub worker
 */

module.exports = function (hoodie, callback) {

  var pubSub = new PubSub(hoodie);

  hoodie.task.on('subscribe:add', pubSub.subscribe);
  hoodie.task.on('unsubscribe:add', pubSub.unsubscribe);
  hoodie.task.on('subscribers:add', pubSub.subscribers);
  hoodie.task.on('subscriptions:add', pubSub.subscriptions);

  // hoodie.task.on('publish:add', pubSub.publish);
  hoodie.account.on('user:change', pubSub.addFilterEachUser);
  callback();

};
