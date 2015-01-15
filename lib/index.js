var PubSubApi = require('./pubsub');
var NetworkApi = require('./network');
var Db = require('./db');
var _ = require('lodash');
var utils = require('hoodie-utils-plugins')('pubsub:index');
var ExtendedDatabaseAPI = utils.ExtendedDatabaseAPI;
var async = require('async');

module.exports = function (hoodie) {
  var pubsub = {};
  var pluginDb = new Db(hoodie, 'plugins/hoodie-plugin-pubsub');

  /**
   * PubSub dbName
   */

  pubsub.addFilterEachUser = function (_doc) {
    if (_doc.roles && _doc.roles.indexOf('confirmed') >= 0) {
      var userDbName = 'user/' + _doc.hoodieId;
      var userDb = new ExtendedDatabaseAPI(hoodie, hoodie.database(userDbName));

      async.series([
        async.apply(pluginDb.userFilter, hoodie, userDb)
      ],
      function (err) {
        if (err) console.error('PubSub.ensureUserFilter:', err);
      });
    }
  };

  _.extend(pubsub,  new PubSubApi(hoodie, pluginDb));
  _.extend(pubsub,  new NetworkApi(hoodie, pluginDb));


  return pubsub;
};
