/**
 * Hoodie plugin pubsub
 * Lightweight and easy pubsub
 */

var async = require('async');

module.exports = function (hoodie, callback) {
  var PubSub = require('./lib/pubsub')(hoodie);
  var Design = require('./lib/design')(hoodie);

  hoodie.task.on('subscribe:add', function (db, task) {
    var subject = task.subject;
    var sourceDbName = 'user/' + task.userId;
    var targetDbName = db;

    if (!task.userId || !subject) {
      return hoodie.task.error(db, task, 'Pls, fill the params: userId and subject');
    }

    PubSub.subscribe(subject, sourceDbName, targetDbName, function (err, req) {
      // console.log(err && err.error)
      if (err) return hoodie.task.error(db, task, err.error || err);
      hoodie.task.success(db, task);
    });
  });

  hoodie.task.on('unsubscribe:add', function (db, task) {
    var subject = task.subject;
    var sourceDbName = 'user/' + task.userId;
    var targetDbName = db;

    if (!task.userId || !subject) {
      return hoodie.task.error(db, task, 'Pls, fill the params: userId and subject');
    }

    PubSub.unsubscribe(subject, sourceDbName, targetDbName, function (err, req) {
      // console.log(err && err.error)
      if (err) return hoodie.task.error(db, task, err.error || err);
      hoodie.task.success(db, task);
    });
  });

  hoodie.task.on('publish:add', function (db, task) {
    console.log('publish:add', task);

    hoodie.task.success(db, task);
    // hoodie.task.error(db, task, err);
  });

  hoodie.account.on('change', function (_doc) {
    console.log(_doc.roles)
    if (_doc.roles && _doc.roles.indexOf('confirmed') >= 0) {
      Design.ensureUserFilter(_doc.hoodieId, function (err, _doc) {
        if (err) console.error('PubSub.ensureUserFilter:', err);
      });
    }
  });

  async.series([
    async.apply(PubSub.addDb),
  ],
  callback);
};




