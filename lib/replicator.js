var utils = require('./utils');

module.exports = function (hoodie) {
  var Design = require('./design')(hoodie);

  var Replicator = {};

  /**
   * Private
   */
  function _ensureUserFilter(userId, callback) {
    var userDbName = encodeURIComponent('user/' + userId);
    var ddoc = utils.filtersDoc('pubsub', 'by_type', function (doc, req) {
      if (doc.type == req.query.id) {
        return true;
      } else {
        return false;
      }
    });

    Design.add(userDbName, '_design/pubsub', ddoc, function (err, _doc, res) {
      if (err && !_doc) return callback(err);
      callback(null, _doc);
    });
  }

  /**
   * Public
   */
  Replicator.find = function (type, id, callback) {
    var replicatorId = encodeURIComponent([type, id].join('/'));
    hoodie.request('GET', '/_replicator/' + replicatorId, {}, callback);
  };

  Replicator.add = function (type, id, data, callback) {
    Replicator.find(type, id, function (err, _doc, res) {
      if (res.statusCode === 404) {
        var hoodieId = utils.dbNametoHoodieId(data.source);
        return _ensureUserFilter(hoodieId, function (err, _doc) {
          if (err) return callback(err);
          hoodie.request('POST', '/_replicator', { data: data }, callback);
        });
      } else if (err) {
        return callback(err);
      }

      return callback('Replicator already exists.', _doc);
    });
  };

  Replicator.remove = function (type, id, callback) {
    var replicatorId = encodeURIComponent([type, id].join('/'));
    Replicator.find(type, id, function (err, _doc, res) {
      if (res.statusCode === 404) {
        return callback('Replicator not found.');
      } else if (err) {
        return callback(err);
      }

      hoodie.request('DELETE', '/_replicator/' + replicatorId + '?rev=' + _doc._rev, {}, callback);
    });
  };

  return Replicator;
};
