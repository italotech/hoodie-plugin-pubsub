/**
 * Hoodie plugin pubsub
 * Lightweight and easy pubsub
 */

var async = require('async');

module.exports = function (hoodie, callback) {
  var PubSub = require('./lib/pubsub')(hoodie);

  console.log('PUBSUB INITIALIZED');

  hoodie.task.on('subscribe:add', function (db, task) {
    var subject = task.subject;
    var sourceDbName = 'user/' + task.userId;
    var targetDbName = db;

    if (!task.userId || !subject) {
      return hoodie.task.error(db, task, 'Pls, fill the params: userId and subject');
    }

    try {
      PubSub.subscribe(subject, sourceDbName, targetDbName, function (err, req) {
        console.log(err && err.error)
        if (err) return hoodie.task.error(db, task, err.error || err);
        hoodie.task.success(db, task);
      });
    } catch (err) {
      hoodie.task.error(db, task, err.error || err);
    }
  });

  hoodie.task.on('unsubscribe:add', function (db, task) {
    var subject = task.subject;
    var sourceDbName = 'user/' + task.userId;
    var targetDbName = db;

    if (!task.userId || !subject) {
      return hoodie.task.error(db, task, 'Pls, fill the params: userId and subject');
    }

    try {
      PubSub.unsubscribe(subject, sourceDbName, targetDbName, function (err, req) {
        console.log(err && err.error)
        if (err) return hoodie.task.error(db, task, err.error || err);
        hoodie.task.success(db, task);
      });
    } catch (err) {
      hoodie.task.error(db, task, err.error || err);
    }
  });

  hoodie.task.on('publish:add', function (db, task) {
    console.log('publish:add', task);

    try {
      hoodie.task.success(db, task);
    } catch (err) {
      hoodie.task.error(db, task, err);
    }
  });

  async.series([
    async.apply(PubSub.addDb),
  ],
  callback);
};




