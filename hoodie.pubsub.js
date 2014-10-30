/**
 * Hoodie plugin pubsub
 * Lightweight and easy pubsub
 */

/* global Hoodie */

Hoodie.extend(function (hoodie) {
  'use strict';

  hoodie.pubsub = {
    subscribe: function (userId, subject) {
      var task = {
        userId: userId,
        subject: subject
      };
      return hoodie.task('subscribe').start(task);
    },

    unsubscribe: function (userId, subject) {
      var task = {
        userId: userId,
        subject: subject
      };
      return hoodie.task('unsubscribe').start(task);
    },

    // publish: function (userId, type) {
    //   var task = {
    //     userId: userId,
    //     type: type
    //   };
    //   return hoodie.task('publish').start(task);
    // }
  }

});
