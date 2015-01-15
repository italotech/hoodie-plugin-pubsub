/**
 * Hoodie plugin pubsub
 * Lightweight and easy pubsub
 */

/* global Hoodie */

Hoodie.extend(function (hoodie) {
  'use strict';

  hoodie.pubsub = {

    
    subscribe: function (userId, subject) {
      var defer = window.jQuery.Deferred();
      defer.notify('subscribe', arguments, false);
      var task = {
        userId: userId,
        subject: subject
      };
      hoodie.task('subscribe').start(task)
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },

    unsubscribe: function (userId, subject) {
      var defer = window.jQuery.Deferred();
      defer.notify('unsubscribe', arguments, false);
      var task = {
        userId: userId,
        subject: subject
      };
      hoodie.task('unsubscribe').start(task)
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },

    subscribers: function (userId) {
      var defer = window.jQuery.Deferred();
      defer.notify('subscribers', arguments, false);
      var task = {
        userId: userId || hoodie.id()
      };
      hoodie.task('subscribers').start(task)
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },

    subscriptions: function (userId) {
      var defer = window.jQuery.Deferred();
      defer.notify('subscriptions', arguments, false);
      var task = {
        userId: userId || hoodie.id()
      };
      hoodie.task('subscriptions').start(task)
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    }
  };
  
  // var debugPromisseGstart = function (text) {
  //   var defer = window.jQuery.Deferred();
  //   (window.debug === 'pubsub') && console.groupCollapsed(text);
  //   defer.resolve({});
  //   return defer.promise();
  // };

  // var debugPromisseGend = function () {
  //   var defer = window.jQuery.Deferred();
  //   (window.debug === 'pubsub') && console.groupEnd();
  //   defer.resolve({});
  //   return defer.promise();
  // };

  function out(name, obj, task) {
    if (window.debug === 'pubsub') {
      var group = (task) ? 'task: ' + task + '(' + name + ')': 'method: ' + name;

      console.groupCollapsed(group);
      if (!!obj)
        console.table(obj);
      console.groupEnd();
    }
  }
  
  if (window.debug === 'pubsub') {
    hoodie.task.on('start', function () {
      out('start', arguments[0], arguments[0].type);
    });

    // task aborted
    hoodie.task.on('abort', function () {
      out('abort', arguments[0], arguments[0].type);
    });

    // task could not be completed
    hoodie.task.on('error', function () {
      out('error', arguments[1], arguments[1].type);
    });

    // task completed successfully
    hoodie.task.on('success', function () {
      out('success', arguments[0], arguments[0].type);
    });
  }

});
