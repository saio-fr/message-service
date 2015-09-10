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
var when = require('when');
var moment = require('moment');
var Wsocket = require('@saio/wsocket-component');
var Db = require('@saio/db-component');
var Config = require('./config.js');

var MessageService = function(container, options) {
  var config = Config.build(options);

  this.ws = container.use('ws', Wsocket, config.ws);
  this.db = container.use('db', Db, config.db);

  this.visitorSendUrl = 'fr.saio.api.public.license..id..message.send.';
  this.operatorSendUrl = 'fr.saio.api.private.license..id..message.send.';
  this.messageModel = this.db.model.Message;
};

MessageService.prototype.start = function() {
  var that = this;
  return this.ws.register(this.visitorSendUrl,
    _.bind(this.send, this, true),
    { match: 'wildcard', invoke: 'roundrobin'})
  .then(function() {
    return that.ws.register(that.operatorSendUrl,
    _.bind(that.send, that, false),
    { match: 'wildcard', invoke: 'roundrobin'});
  })
  .then(function() {
    console.log('message-service started');
    return when.resolve();
  });
};

MessageService.prototype.stop = function() {
  return this.ws.unregister()
  .then(function() {
    console.log('message-service stopped');
    return when.resolve();
  });
};

/**
 * args: useless
 * kwargs.message: string
 * details.wildcards[0]: license
 * details.wildcards[1]: sender authId
 * details.wildcards[2]: thread authId
 */
MessageService.prototype.send = function(isVisitorSender, args, kwargs, details) {
  var that = this;
  var date = moment.utc().valueOf();
  var license;
  var thread;
  var sender;
  var message;
  var messageChannelUrl;
  if (_.isUndefined(kwargs) || _.isUndefined(details) ||
      _.isUndefined(kwargs.message) || !_.isString(kwargs.message) ||
      _.isUndefined(details.wildcards) || _.isNull(details.wildcards) ||
      details.wildcards.length < 3) {
    throw new Error('invalid message');
  }

  license = details.wildcards[0];
  sender = details.wildcards[1];
  thread = details.wildcards[2];
  message = kwargs.message;

  if (isVisitorSender && thread !== sender) {
    throw new Error('unauthorized to post a message to thread: ' + thread);
  }

  messageChannelUrl = 'fr.saio.api.public.license.' + license + '.id.' + thread + '.message';
  return this.ws.publish(messageChannelUrl, [], {
    message: message,
    date: date,
    sender: sender
  })
  .then(function() {
    return that.messageModel.create({
      license: license,
      thread: thread,
      sender: sender,
      date: date,
      message: message
    });
  })
  .then(function() {
    return when.resolve(true);
  })
  .catch(function(err) {
    console.error(err.stack);
    return when.reject(new Error('internal server error'));
  });
};

module.exports = MessageService;
