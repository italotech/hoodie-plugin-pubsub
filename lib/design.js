module.exports = function (hoodie) {
  var Design = {};

  /**
   * Public
   */
  Design.find = function (userDbName, id, callback) {
    var designUrl = '/' + userDbName + '/' + id;
    hoodie.request('GET', designUrl, {}, callback);
  };

  Design.add = function (userDbName, id, data, callback) {
    var designUrl = '/' + userDbName + '/' + id;
    Design.find(userDbName, id, function (err, _doc, res) {
      if (res.statusCode === 404) {
        return hoodie.request('PUT', designUrl, { data: data }, callback);
      } else if (err) {
        return callback(err);
      }

      return callback('Design already exists.', _doc);
    });
  };

  Design.remove = function (userDbName, id, callback) {
    var designUrl = '/' + userDbName + '/' + id;
    Design.find(userDbName, id, function (err, _doc, res) {
      if (res.statusCode === 404) {
        return callback('Design document not found.');
      } else if (err) {
        return callback(err);
      }

      hoodie.request('DELETE', designUrl + '?rev=' + _doc._rev, {}, callback);
    });
  };

  return Design;
};
