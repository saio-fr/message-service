/*-------------------------------------------------*\
 |                                                 |
 |      /$$$$$$    /$$$$$$   /$$$$$$   /$$$$$$     |
 |     /$$__  $$  /$$__  $$ |_  $$_/  /$$__  $$    |
 |    | $$  \__/ | $$  \ $$   | $$   | $$  \ $$    |
 |    |  $$$$$$  | $$$$$$$$   | $$   | $$  | $$    |
 |     \____  $$ | $$__  $$   | $$   | $$  | $$    |
 |     /$$  \ $$ | $$  | $$   | $$   | $$  | $$    |
 |    |  $$$$$$/ | $$  | $$  /$$$$$$ |  $$$$$$/    |
 |     \______/  |__/  |__/ |______/  \______/     |
 |                                                 |
 |                                                 |
 |                                                 |
 |    *---------------------------------------*    |
 |    |   © 2015 SAIO - All Rights Reserved   |    |
 |    *---------------------------------------*    |
 |                                                 |
\*-------------------------------------------------*/

var path = require('path');
var _ = require('underscore');

// complete possible missing key in config
function complete(config) {
  config = _.defaults(config, {
    ws: {},
    db: {}
  });

  config.ws = _.defaults(config.ws, {
    url: undefined,
    realm: undefined,
    authId: undefined,
    password: undefined
  });

  config.db = _.defaults(config.db, {
    dialect: undefined,
    user: undefined,
    password: undefined,
    host: undefined,
    port: undefined,
    dbname: undefined
  });

  config.db.model = './model/message.js';
}

// overwrite static config by runtime options
function overwrite(config, options) {
  _.each(options, function(value, key) {
    var splittedKey = key.split('-');
    if (splittedKey.length !== 2 ||
        !_.has(config, splittedKey[0]) ||
        !_.has(config[splittedKey[0]], splittedKey[1])) {
      throw new Error('invalid option: ' + key);
    }

    config[splittedKey[0]][splittedKey[1]] = value;
  });
}

// return the first key whose value is undefined
function getUndefinedField(object) {
  return _.findKey(object, function(value) {
    return _.isUndefined(value);
  });
}

/**
 * config: static, parsed from a config file
 * runOptions: runtime arguments that complete the config
 */
function build(runOptions) {
  var config;
  try {
    config = require(path.resolve(process.env.PWD, 'config/config.json'));
  } catch (err) {
    throw new Error('config file not found');
  }

  complete(config);
  overwrite(config, runOptions);

  var undefKey = getUndefinedField(config);
  if (!_.isUndefined(undefKey)) {
    throw new Error('missing config key: config.' + undefKey);
  }

  undefKey = getUndefinedField(config.ws);
  if (!_.isUndefined(undefKey)) {
    throw new Error('missing config key: config.ws.' + undefKey);
  }

  undefKey = getUndefinedField(config.db);
  if (!_.isUndefined(undefKey)) {
    throw new Error('missing config key: config.db.' + undefKey);
  }

  return config;
}

module.exports.build = build;
