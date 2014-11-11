/**
 * Hoodie plugin pubsub
 * Lightweight and easy pubsub
 */

var async = require('async'),
    PubSub = require('./lib/pubsub'),
    utisl = require('./lib/utils'),
    _ = require('lodash');

exports.dbname = 'plugins/hoodie-plugin-pubsub';

module.exports = function (hoodie, callback) {

    var pluginDb = hoodie.database(exports.dbname),
      pubsub = new PubSub(hoodie, pluginDb);

  hoodie.task.on('subscribe:add', pubsub.subscribe);
  hoodie.task.on('unsubscribe:add', pubsub.unsubscribe);


  hoodie.task.on('publish:add', function (db, task) {
    console.log('publish:add', task);

    hoodie.task.success(db, task);
    // hoodie.task.error(db, task, err);
  });

  hoodie.account.on('change', function (_doc) {
    if(_doc.type && _doc.type === 'user') {
      var userDbName = 'user/' + _doc.hoodieId;
      var userDb = hoodie.database(userDbName);
      async.series([
          async.apply(extendDb, hoodie, userDb),
          async.apply(exports.dbFilter, hoodie, userDb)
        ],
        function (err, _doc) {
          if (err) console.error('PubSub.ensureUserFilter:', err);
        }
      )
    }
  });

  async.series([
    async.apply(exports.dbAdd, hoodie),
  ],
  callback);
};

exports.dbAdd = function (hoodie, callback) {

  hoodie.database.add(exports.dbname, function (err) {

    if (err) {
      return callback(err);
    }

    return callback();

  });

};

exports.dbFilter = function (hoodie, pluginDb, callback) {
  var filter = function (doc, req) {
    if (doc.type == req.query.id) {
      return true;
    } else {
      return false;
    }
  };

  pluginDb.addFilter('pubsub', 'by_type', filter, function (err, data) {
    if (err) {
      return callback(err);
    }

    return callback();
  })
};


//TODO: Pullrequest
function extendDb(hoodie, pluginDb, cb) {
  var db = pluginDb;
/**
   * CouchDB views created using `db.addIndex()` are all stored in the same
   * design document: `_design/views`.
   * See https://github.com/hoodiehq/hoodie.js/issues/70#issuecomment-20506841
   */


  /**
   * Creates new design doc with CouchDB view on db
   */

  db.addFilter = function (filterName, name, filter, callback) {
    var views_ddoc_id = '_design/' + filterName;
    var views_ddoc_url = db._resolve(views_ddoc_id);

    hoodie.request('GET', views_ddoc_url, {}, function (err, ddoc, res) {
      if (res.statusCode === 404) {
        // not found, so we use new object.
        ddoc = {
          language: 'javascript',
          filters: {}
        };
      } else if (err) {
        return callback(err);
      }

      // View functions need to be serialised/stringified.
      var serialised = filter.toString();

      // If view code has not changed we don't need to do anything else.
      // NOTE: Not sure if this is the best way to deal with this. This
      // saves work and avoids unnecessarily overwriting the
      // `_design/views` document when no actual changes have been made to
      // the view code (map/reduce).
      if (_.isEqual(serialised, ddoc.filters[name])) {
        return callback(null, {
          ok: true,
          id: ddoc._id,
          rev: ddoc._rev
        });
      }

      ddoc.filters[name] = serialised;

      hoodie.request('PUT', views_ddoc_url, {data: ddoc}, callback);
    });
  };

  /**
   * Removes couchdb view from db
   */

  db.removeIndex = function (filterName, name, callback) {
    var views_ddoc_id = '_design/' + filterName;
    var views_ddoc_url = db._resolve(views_ddoc_id);
    hoodie.request('GET', views_ddoc_url, {}, function (err, ddoc) {
      if (err) {
        return callback(err);
      }

      if (ddoc.filters && ddoc.filters[name]) {
        delete ddoc.filters[name];
      }

      hoodie.request('PUT', views_ddoc_url, {data: ddoc}, callback);
    });
  };
  cb();
};
