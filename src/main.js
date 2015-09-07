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

var _ = require('underscore');
var Wsocket = require('@saio/wsocket-component');
var Db = require('@saio/db-component');
var Config = require('./config.js');


var MessageService = function(container, options) {
  var config = Config.build(options);

  this.ws = container.use('ws', Wsocket, config.ws);
  this.db = container.use('db', Db, config.db);
};

MessageService.prototype.start = function() {
  var that = this;
};

/**
 * args: useless
 * kwargs.message: string
 * kwargs.meta: json
 * details.wildcards[0]: must be licenseId
 * details.wildcards[1]: must be visitor authId
 */
MessageService.prototype.onVisitorMessage = function(args, kwargs, details) {
  return when.promise(function(resolve, reject) {
    if (_.isUndefined(kwargs.message) || !_.isString(kwargs.message)) {
      // TODO log error
      reject(new Error('invalid message'));
      return;
    }

    if (_.isNull(details.wildcards) || details.wildcards.length < 2) {
      reject(new Error('wamp uri parsing error'));
      return;
    }

    var licenseId = details.wildcards[0];
    var visitorId

    var forwardPromise =
  });
};

/**
 * parse kwargs & details & return {
 * 	message: string
 * 	meta: json or undefined
 * 	licenseId: string
 * 	visitorId: string
 * 	date: Date
 * }
 * or throws if kwargs/details not valid
 */
MessageService.prototype.validateMessage = function(args, kwargs, details) {
  if (_.isUndefined(kwargs) || _.isUndefined(kwargs.message) || !_.isString(kwargs.message) ||
      _.isUndefined(details) || _.isNull(details.wildcards) || details.wildcards.length < 2 ||
      (!_.isUndefined(kwargs.meta) && !_.isObject(kwargs.meta))) {
    throw new Error('invalid message');
  }

  var res = {
    message: kwargs.message,
    licenseId: details.wildcards[0],
    visitorId: details.wildcards[1]
  }
  var licenseId = details.wildcards[0];
  var visitorId
};

/**
 * args: useless
 * kwargs.message: string
 * kwargs.meta: json
 * details.wildcards[0]: must be licenseId
 * details.wildcards[1]: must be visitor authId
 */
MessageService.prototype.onOperatorMessage = function(args, kwargs, details) {

};

/**
 * message:
 */
MessageService.prototype.saveMessage = function(message, metadata) {

};

MessageService.prototype.stop = function() {

};

module.exports = MessageService;
