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
var rewire = require('rewire');
var stubPath = require('./helpers/pathStub.js').stub;
var Config = rewire('../src/config.js');

tape('config.js', function(t) {
  t.test('throws if config file not found', function(st) {
    var options = {};
    var expected = /config file not found/;
    Config.__set__('path', stubPath('../test/helpers/undefined.json'));

    function run() {
      return Config.build(options);
    }

    st.plan(1);
    st.throws(run, expected);
    st.end();
  });

  t.test('throws if missing field in config (no options)', function(st) {
    var options = {};
    var expected = /missing config key: config.db/;
    Config.__set__('path', stubPath('../test/helpers/configMissingField.json'));

    function run() {
      return Config.build(options);
    }

    st.plan(1);
    st.throws(run, expected);
    st.end();
  });

  t.test('throws if missing sub-field in config (no options)', function(st) {
    var options = {};
    var expected = /missing config key: config.db.host/;
    Config.__set__('path', stubPath('../test/helpers/configMissingSubField.json'));

    function run() {
      return Config.build(options);
    }

    st.plan(1);
    st.throws(run, expected);
    st.end();
  });

  t.test('valid config (no options)', function(st) {
    var options = {};
    var expected = require('./helpers/configComplete.json');
    expected.db.model = './model/message.js';
    Config.__set__('path', stubPath('../test/helpers/configComplete.json'));

    st.plan(1);
    st.deepEqual(Config.build(options), expected, 'valid config');
    st.end();
  });

  t.test('valid config with missing field but completed by option', function(st) {
    var options = { 'db-host': 'localhost' };
    var expected = require('./helpers/configComplete.json');
    expected.db.model = './model/message.js';
    Config.__set__('path', stubPath('../test/helpers/configMissingSubField.json'));

    st.plan(1);
    st.deepEqual(Config.build(options), expected, 'valid config');
    st.end();
  });

  t.test('valid config overwritten by option', function(st) {
    var options = { 'db-host': '8.8.8.8' };
    var expected = require('./helpers/configComplete.json');
    expected.db.model = './model/message.js';
    expected.db.host = options['db-host'];
    Config.__set__('path', stubPath('../test/helpers/configComplete.json'));

    st.plan(1);
    st.deepEqual(Config.build(options), expected, 'valid config');
    st.end();
  });

  t.test('all in one (missing fields + overwrite)', function(st) {
    var options = {
      'ws-url': 'ws://localhost:8080', // overwrite
      'ws-authId': 'service', // missing
      'ws-password': 'service', // missing
      'db-host': '8.8.8.8', // overwrite
      'db-user': 'root', // missing
      'db-password': '' // missing
    };
    var expected = require('./helpers/configComplete.json');
    Config.__set__('path', stubPath('../test/helpers/configMissingSubFields.json'));

    st.plan(1);
    st.deepEqual(Config.build(options), expected, 'valid config');
    st.end();
  });
});
