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

  hoodie.task.on('pubsubbidirectional:add', pubSub.bidirectional);
  hoodie.task.on('pubsubunbidirectional:add', pubSub.unbidirectional);
  hoodie.task.on('pubsubsubscribe:add', pubSub.subscribe);
  hoodie.task.on('pubsubunsubscribe:add', pubSub.unsubscribe);
  hoodie.task.on('pubsubsubscribers:add', pubSub.subscribers);
  hoodie.task.on('pubsubsubscriptions:add', pubSub.subscriptions);
  // hoodie.task.on('publish:add', pubSub.publish);
  hoodie.account.on('user:change', pubSub.addFilterEachUser);
  callback();

};
