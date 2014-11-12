/**
 * This code is part of hoodiehq/hoodie-plugins-api, patched to add `filters`
 * design capability
 *
 * see https://raw.githubusercontent.com/hoodiehq/hoodie-plugins-api/dd118e3b66dd520701f369f6410b1a05708db1a6/lib/database.js
 */


/**
 * Dependencies
 */

var url = require('url');
var _ = require('underscore');



/**
 * Extended DatabaseAPI
 */

exports.ExtendedDatabaseAPI = function ExtendedDatabaseAPI(hoodie, db) {

  /**
   * CouchDB views created using `db.addIndex()` are all stored in the same
   * design document: `_design/views`.
   * See https://github.com/hoodiehq/hoodie.js/issues/70#issuecomment-20506841
   *
   * update:
   * @todo Open issue to add generic design documents API
   */

  function designDocAdd(ddoc_type, ddoc_name, ddoc_data, callback) {
    var ddoc_url = db._resolve('_design/' + ddoc_type);

    hoodie.request('GET', ddoc_url, {}, function (err, ddoc, res) {
      if (res.statusCode === 404) {
        // not found, so we use new object.
        ddoc = {
          language: 'javascript'
        };
        ddoc[ddoc_type] = {};
      } else if (err) {
        return callback(err);
      }

      // View functions need to be serialised/stringified.
      var serialised = ddoc_data.toString();

      // If view code has not changed we don't need to do anything else.
      // NOTE: Not sure if this is the best way to deal with this. This
      // saves work and avoids unnecessarily overwriting the
      // `_design/views` document when no actual changes have been made to
      // the view code (map/reduce).
      if (_.isEqual(serialised, ddoc[ddoc_type][ddoc_name])) {
        return callback(null, {
          ok: true,
          id: ddoc._id,
          rev: ddoc._rev
        });
      }

      ddoc[ddoc_type][ddoc_name] = serialised;

      hoodie.request('PUT', ddoc_url, {data: ddoc}, callback);
    });
  };

  function designDocRemove(ddoc_type, ddoc_name) {
    var ddoc_url = db._resolve('_design/' + ddoc_type);

    hoodie.request('GET', ddoc_url, {}, function (err, ddoc) {
      if (err) {
        return callback(err);
      }

      if (ddoc.views && ddoc[ddoc_type][ddoc_name]) {
        delete ddoc[ddoc_type][ddoc_name];
      }

      hoodie.request('PUT', ddoc_url, {data: ddoc}, callback);
    });
  }

  /**
   * Creates new design doc with CouchDB filter on db
   */

  db.addFilter = function (name, filterFunction, callback) {
    designDocAdd('filters', name, filterFunction, callback);
  };

  /**
   * Removes couchdb filter from db
   */

  db.removeFilter = function (name, callback) {
    designDocRemove('filters', name, callback);
  };

  /**
   * Add/remove indexes using generic methods

  /**
   * Creates new index design doc with CouchDB view on db
   -/

  db.addIndex = function (name, mapReduce, callback) {
    designDocAdd('views', name, mapReduce, callback);
  };

  /**
   * Removes couchdb view from db
   -/

  db.removeIndex = function (name, callback) {
    designDocRemove('views', name, callback);
  };
  */

  return db;
};
