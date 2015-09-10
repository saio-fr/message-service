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

var tape = require('blue-tape');
var when = require('when');
var _ = require('underscore');

var Wsocket = require('@saio/wsocket-component');

var MessageHandler = require('./messageHandler.js');
var conversation = require('./conversation.json');

/**
 * options: {
 * 		license
 * 		thread
 * 		authId
 * 		isOperator
 * }
 */
var User = function(container, options) {
  this.receiveUrl = 'fr.saio.api.public' +
    '.license.' + options.license +
    '.id.' + options.thread +
    '.message';

  this.sendUrl = 'fr.saio.api.' + (options.isOperator ? 'private' : 'public') +
    '.license.' + options.license +
    '.id.' + options.authId +
    '.message.send.' + options.thread;

  this.messageHandler = new MessageHandler(conversation, options.authId);

  this.ws = container.use('ws', Wsocket, {
    url: 'ws://crossbar:8080',
    realm: 'saio',
    authId: options.authId,
    password: 'password'
  });
};

User.prototype.start = function() {
  return this.ws.subscribe(this.receiveUrl, _.bind(this._onMessage, this));
};

User.prototype.stop = function() {
  return this.ws.unsubscribe();
};

User.prototype.startConversation = function(onend) {
  this.onend = onend;
  var message = this.messageHandler.init();
  if (!_.isUndefined(message)) {
    this.ws.call(this.sendUrl, [], { message: message });
  }
};

User.prototype._onMessage = function(args, kwargs, details) {
  var answer = this.messageHandler.receive(kwargs.message, kwargs.sender);
  if (!_.isUndefined(answer)) {
    this.ws.call(this.sendUrl, [], { message: answer });
  }
  if (this.messageHandler.completed) {
    this.onend(this.messageHandler.failed);
  }
};

module.exports = User;
