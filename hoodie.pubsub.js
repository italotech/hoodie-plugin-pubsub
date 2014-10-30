/**
 * Hoodie plugin pubsub
 * Lightweight and easy pubsub
 */

/* global Hoodie */

Hoodie.extend(function (hoodie) {
  'use strict';

  hoodie.pubsub = {
    subscribe: function (hoodieId, type) {
      var message = {
        hoodieId: hoodieId,
        type: type
      };
      return hoodie.task('subscribe').start(message);
    },

    unsubscribe: function (task) {
      // var defer = window.jQuery.Deferred();
      // return defer.promise();
      return hoodie.task('unsubscribe').start(task);
    },

    publish: function (task) {
      // var defer = window.jQuery.Deferred();
      // return defer.promise();
      return hoodie.task('publish').start(task);
    }
  }

});
