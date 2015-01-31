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
    var userDbName = 'user/' + _doc.hoodieId;

    if (_doc.$error) {
      // don't do any further processing to user docs with $error
      return;
    } else if (_doc._deleted && !_doc.$newUsername) {
      return;
    } else if (_doc.roles && _doc.roles.indexOf('confirmed') >= 0) {
      var userDb = new ExtendedDatabaseAPI(hoodie, hoodie.database(userDbName));

      async.series([
        async.apply(pluginDb.userFilter, hoodie, userDb)
      ],
      function (err) {
        var outerr = err && err.response && err.response.req && 'method: ' + err.response.req.method + ' ';
        outerr += err && err.response && err.response.req && 'path: ' + err.response.req.path + ' ';
        if (err && err.error !== 'conflict') console.error('PubSub.ensureUserFilter:', userDbName, err.error, outerr);

      });
    }
  };

  _.extend(pubsub,  new PubSubApi(hoodie, pluginDb));
  _.extend(pubsub,  new NetworkApi(hoodie, pluginDb));


  return pubsub;
};
