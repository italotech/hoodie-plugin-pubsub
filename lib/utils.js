var utils = exports = module.exports;

utils.pubsubId = function (sourceDbName, targetDbName) {
  return [sourceDbName, targetDbName].join('::');
};

utils.dbNametoHoodieId = function (dbName) {
  return dbName.replace(/^user\//, '');
};

utils.replicatorDoc = function (subject, sourceDbName, targetDbName) {
  var subscribeId = subject + '/' + utils.pubsubId(sourceDbName, targetDbName);

  return {
    _id: subscribeId,
    source: sourceDbName,
    target: targetDbName,
    filter: 'pubsub/by_type',
    query_params: {
      id: subject
    },
    user_ctx: {
      roles: [
         'hoodie:read:' + sourceDbName,
         'hoodie:write:' + targetDbName
      ]
    },
    continuous: true
  };
};

utils.filtersDoc = function (type, name, fn) {
  var designDoc = {
    _id: '_design/' + type,
    filters: {}
  };
  designDoc.filters[name] = fn.toString();
  return designDoc;
};
