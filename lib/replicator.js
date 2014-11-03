module.exports = function (hoodie, callback) {
  var Replicator = {};

  Replicator.find = function (type, id, callback) {
    var replicatorId = encodeURIComponent([type, id].join('/'));
    hoodie.request('GET', '/_replicator/' + replicatorId, {}, callback);
  };

  Replicator.add = function (type, id, data, callback) {
    var replicatorId = encodeURIComponent([type, id].join('/'));
    this.find(type, id, function (err, _doc) {
      var replicatorExists = !(err && err.error === 'not_found');
      if (!err) {
        return callback('Replicator already exists.', err);
      }
      hoodie.request('POST', '/_replicator', { data: data }, callback);
    });
  };

  Replicator.remove = function (type, id, callback) {
    var replicatorId = encodeURIComponent([type, id].join('/'));
    this.find(type, id, function (err, _doc) {
      var replicatorExists = !(err && err.error === 'not_found');
      if (!replicatorExists) {
        return callback('Replicator not found.', err);
      }
      hoodie.request('DELETE', '/_replicator/' + replicatorId + '?rev=' + _doc._rev, {}, callback);
    });
  };

  return Replicator;
};
