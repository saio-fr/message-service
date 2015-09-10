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
var Db = require('@saio/db-component');
var Tester = require('@saio/service-runner').Tester;
var User = require('./helpers/user.js');
var conversation = require('./helpers/conversation.json');

tape('message service integration test', function(t) {
  var license = '12345';
  var thread = 'visitor';

  var Test = function(container) {
    this.db = container.use('db', Db, {
      dialect: 'postgres',
      user: 'postgres',
      password: 'test',
      host: 'db',
      port: '5432',
      dbname: 'postgres',
      model: 'model/message.js'
    });

    this.visitor = container.use('visitor', User, {
      license: license,
      thread: thread,
      authId: 'visitor',
      isOperator: false
    });

    this.operator1 = container.use('operator1', User, {
      license: license,
      thread: thread,
      authId: 'operator1',
      isOperator: true
    });

    this.operator2 = container.use('operator2', User, {
      license: license,
      thread: thread,
      authId: 'operator2',
      isOperator: true
    });
  };

  // return promise that resolve if conversation success for all members
  // && if all conversation stored & ordered in db
  Test.prototype.run = function() {
    var that = this;
    return when.promise(function(resolve, reject) {
      var endedConversationCount = 0;
      var conversationCompleted = false;
      var conversationFailed = false;

      function onend(failed) {
        ++endedConversationCount;
        if (failed) {
          conversationFailed = true;
        }

        if (endedConversationCount === 3) {
          conversationCompleted = true;
        }
      }

      // timeout used to wait all messages to be sent, received & stored in db
      // ugly but more readable than a long chain of promises
      setTimeout(function() {
        if (conversationFailed) {
          reject(new Error('conversation send/receive fail: wrong message or sender'));
        } else if (!conversationCompleted) {
          reject(new Error('conversation send/receive fail: timeout'));
        } else {
          resolve();
        }
      }, 4000);

      that.operator1.startConversation(onend);
      that.operator2.startConversation(onend);
      that.visitor.startConversation(onend);
    })
    .then(function() {
      // get all messages of the thread in the db
      return that.db.model.Message.findAll({ where: { thread: thread } });
    })
    .then(function(rows) {
      var dbConversation = _.map(rows, function(row) {
        return row.dataValues;
      });

      // sort rows by growing date
      dbConversation = _.sortBy(dbConversation, 'date');
      if (dbConversation.length < conversation.length) {
        return when.reject(new Error('conversation storage fail: missing messages'));
      }
      if (dbConversation.length > conversation.length) {
        return when.reject(new Error('conversation storage fail: too much messages'));
      }

      var ok = _.every(dbConversation, function(row, i) {
        var expected = conversation[i];
        return row.license === license &&
          row.thread === thread &&
          row.sender === expected.sender &&
          row.message === expected.message;
      });

      if (ok) {
        return when.resolve();
      } else {
        return when.reject(new Error('conversation storage fail: wrong message'));
      }
    });
  };

  var tester = new Tester(Test);
  return tester.start()
  .then(function() {
    return tester.service.run();
  })
  .catch(function(err) {
    t.fail(err.message);
    return when.resolve();
  })
  .then(function() {
    t.pass('all messages well sent, received & stored');
    return tester.stop();
  });
});
