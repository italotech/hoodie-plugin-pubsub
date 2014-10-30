/**
 * Hoodie plugin pubsub
 * Lightweight and easy pubsub
 */

var async = require('async');

var exports = module.exports = function (hoodie, callback) {
  var pluginDb = hoodie.database(exports.dbname);

  console.log('PUBSUB INITIALIZED');

  hoodie.task.on('subscribe:add', function (db, task) {
    console.log('subscribe:add', task);
    try {
      var hoodieId = task.hoodieId,
      type = task.type,
      source = 'user/'+hoodieId,
      target = db;

      //console.log(db, hoodieId);

      exports.subscribe(hoodie, source, target, function (err, req) {
        // debug
        // console.log('error',  arguments);

        if (err) returnhoodie.task.error(db, task, err);

        hoodie.task.success(db, task);
      });
    } catch (err) {
      hoodie.task.error(db, task, err);
    }
  });

  hoodie.task.on('unsubscribe:add', function (db, message) {
    console.log('unsubscribe:add', message);

    try {
      hoodie.task.success(db, message);
    } catch (err) {
      hoodie.task.error(db, message, err);
    }
  });

  hoodie.task.on('publish:add', function (db, message) {
    console.log('publish:add', message);

    try {
      hoodie.task.success(db, message);
    } catch (err) {
      hoodie.task.error(db, message, err);
    }
  });

  async.series([
    async.apply(exports.dbAdd, hoodie),
  ],
  callback);
};


exports.dbname = 'plugins/hoodie-plugin-pubsub';

exports.dbAdd = function (hoodie, callback) {
  hoodie.database.add(exports.dbname, callback);
};

exports.subscribe = function (hoodie, source, target, callback) {
  var replicatorDoc = {
      source: source,
      target: target,
      user_ctx: {
        roles: [
           'hoodie:read:' + source,
           'hoodie:write:' + target
        ]
      },
      continuous :true
  };

  hoodie.request('POST', '/_replicator', { data: replicatorDoc }, callback);
};

