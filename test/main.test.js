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
var moment = require('moment');
var rewire = require('rewire');

var Tester = require('@saio/service-runner').Tester;
var stubPath = require('./helpers/pathStub.js').stub;
var stubWs = require('./helpers/wsocketStub.js').stub;
var stubDb = require('./helpers/dbStub.js').stub;

var Config = rewire('../src/config.js');
var MessageService = rewire('../src/main.js');

tape('main.js', function(t) {
  t.test('visitor send to his thread', function(st) {
    var license = '12345';
    var message = 'helloworld';
    var authId = '54321';

    var registerPublicOk = false;
    var registeredProcedure = null;
    var publishOk = false;
    var createOk = false;

    function register(url, fn, options) {
      if (url === 'fr.saio.api.public.license..id..message.send.') {
        registeredProcedure = fn;
        registerPublicOk = true;
      }
      return when.resolve();
    }

    function publish(url, args, kwargs) {
      var now = moment.utc().valueOf();
      if (url === 'fr.saio.api.public.license.' + license + '.id.' + authId + '.message') {
        publishOk = _.isArray(args) && args.length === 0 &&
          _.isObject(kwargs) &&
          kwargs.sender === authId &&
          kwargs.date <= now &&
          kwargs.date > now - 100 &&
          kwargs.message === message;
      }
      return when.resolve();
    }

    function create(instance) {
      var now = moment.utc().valueOf();
      createOk =  _.isObject(instance) &&
        instance.license === license &&
        instance.thread === authId &&
        instance.sender === authId &&
        instance.date <= now &&
        instance.date > now - 100 &&
        instance.message === message;
      return when.resolve();
    }

    Config.__set__('path', stubPath('../test/helpers/configComplete.json'));
    MessageService.__set__('Config', Config);
    MessageService.__set__('Wsocket', stubWs(register, publish));
    MessageService.__set__('Db', stubDb(create));

    var tester = new Tester(MessageService, {});
    return tester.start()
    .then(function() {
      st.ok(registerPublicOk, 'public send procedure registered');
      return registeredProcedure([],
        { message: message },
        { wildcards: [license, authId, authId] }
      );
    })
    .then(function() {
      st.ok(publishOk, 'message published');
      st.ok(createOk, 'message stored in db');
      return tester.stop();
    });
  });

  t.test('visitor send to wrong thread', function(st) {
    var license = '12345';
    var message = 'helloworld';
    var authId = '54321';
    var thread = '42';

    var registerPublicOk = false;
    var registeredProcedure = null;
    var publishOk = false; // should stay false
    var createOk = false; // should stay false

    function register(url, fn, options) {
      if (url === 'fr.saio.api.public.license..id..message.send.') {
        registeredProcedure = fn;
        registerPublicOk = true;
      }
      return when.resolve();
    }

    function publish(url, args, kwargs) {
      if (url === 'fr.saio.api.public.license.' + license + '.id.' + thread + '.message') {
        publishOk = true;
      }
      return when.resolve();
    }

    function create(instance) {
      createOk = true;
      return when.resolve();
    }

    Config.__set__('path', stubPath('../test/helpers/configComplete.json'));
    MessageService.__set__('Config', Config);
    MessageService.__set__('Wsocket', stubWs(register, publish));
    MessageService.__set__('Db', stubDb(create));

    var tester = new Tester(MessageService, {});
    return tester.start()
    .then(function() {
      st.ok(registerPublicOk, 'public send procedure registered');
      return when.try(function() {
        return registeredProcedure([],
          { message: message },
          { wildcards: [license, authId, thread] }
        );
      });
    })
    .then(function() {
      st.fail('call to public send should have failed');
      return when.resolve();
    })
    .catch(function(err) {
      st.equals(err.message, 'unauthorized to post a message to thread: ' + thread);
    })
    .then(function() {
      st.notOk(publishOk, 'message not published');
      st.notOk(createOk, 'message not stored in db');
      return tester.stop();
    });
  });

  t.test('visitor send undefined message', function(st) {
    var license = '12345';
    var authId = '54321';
    var thread = authId;

    var registerPublicOk = false;
    var registeredProcedure = null;
    var publishOk = false; // should stay false
    var createOk = false; // should stay false

    function register(url, fn, options) {
      if (url === 'fr.saio.api.public.license..id..message.send.') {
        registeredProcedure = fn;
        registerPublicOk = true;
      }
      return when.resolve();
    }

    function publish(url, args, kwargs) {
      if (url === 'fr.saio.api.public.license.' + license + '.id.' + thread + '.message') {
        publishOk = true;
      }
      return when.resolve();
    }

    function create(instance) {
      createOk = true;
      return when.resolve();
    }

    Config.__set__('path', stubPath('../test/helpers/configComplete.json'));
    MessageService.__set__('Config', Config);
    MessageService.__set__('Wsocket', stubWs(register, publish));
    MessageService.__set__('Db', stubDb(create));

    var tester = new Tester(MessageService, {});
    return tester.start()
    .then(function() {
      st.ok(registerPublicOk, 'public send procedure registered');
      return when.try(function() {
        return registeredProcedure([],
          {},
          { wildcards: [license, authId, thread] }
        );
      });
    })
    .then(function() {
      st.fail('call to public send should have failed');
      return when.resolve();
    })
    .catch(function(err) {
      st.equals(err.message, 'invalid message');
    })
    .then(function() {
      st.notOk(publishOk, 'message not published');
      st.notOk(createOk, 'message not stored in db');
      return tester.stop();
    });
  });

  t.test('visitor send a json message (fail expected)', function(st) {
    var license = '12345';
    var message = { key0: 'val0', key1: 'val1' };
    var authId = '54321';
    var thread = authId;

    var registerPublicOk = false;
    var registeredProcedure = null;
    var publishOk = false; // should stay false
    var createOk = false; // should stay false

    function register(url, fn, options) {
      if (url === 'fr.saio.api.public.license..id..message.send.') {
        registeredProcedure = fn;
        registerPublicOk = true;
      }
      return when.resolve();
    }

    function publish(url, args, kwargs) {
      if (url === 'fr.saio.api.public.license.' + license + '.id.' + thread + '.message') {
        publishOk = true;
      }
      return when.resolve();
    }

    function create(instance) {
      createOk = true;
      return when.resolve();
    }

    Config.__set__('path', stubPath('../test/helpers/configComplete.json'));
    MessageService.__set__('Config', Config);
    MessageService.__set__('Wsocket', stubWs(register, publish));
    MessageService.__set__('Db', stubDb(create));

    var tester = new Tester(MessageService, {});
    return tester.start()
    .then(function() {
      st.ok(registerPublicOk, 'public send procedure registered');
      return when.try(function() {
        return registeredProcedure([],
          { message: message },
          { wildcards: [license, authId, thread] }
        );
      });
    })
    .then(function() {
      st.fail('call to public send should have failed');
      return when.resolve();
    })
    .catch(function(err) {
      st.equals(err.message, 'invalid message');
    })
    .then(function() {
      st.notOk(publishOk, 'message not published');
      st.notOk(createOk, 'message not stored in db');
      return tester.stop();
    });
  });

  t.test('operator send valid message', function(st) {
    var license = '12345';
    var message = 'helloworld';
    var authId = '54321';
    var thread = '42';

    var registerPrivateOk = false;
    var registeredProcedure = null;
    var publishOk = false;
    var createOk = false;

    function register(url, fn, options) {
      if (url === 'fr.saio.api.private.license..id..message.send.') {
        registeredProcedure = fn;
        registerPrivateOk = true;
      }
      return when.resolve();
    }

    function publish(url, args, kwargs) {
      var now = moment.utc().valueOf();
      if (url === 'fr.saio.api.public.license.' + license + '.id.' + thread + '.message') {
        publishOk = _.isArray(args) && args.length === 0 &&
          _.isObject(kwargs) &&
          kwargs.sender === authId &&
          kwargs.date <= now &&
          kwargs.date > now - 100 &&
          kwargs.message === message;
      }
      return when.resolve();
    }

    function create(instance) {
      var now = moment.utc().valueOf();
      createOk =  _.isObject(instance) &&
        instance.license === license &&
        instance.thread === thread &&
        instance.sender === authId &&
        instance.date <= now &&
        instance.date > now - 100 &&
        instance.message === message;
      return when.resolve();
    }

    Config.__set__('path', stubPath('../test/helpers/configComplete.json'));
    MessageService.__set__('Config', Config);
    MessageService.__set__('Wsocket', stubWs(register, publish));
    MessageService.__set__('Db', stubDb(create));

    var tester = new Tester(MessageService, {});
    return tester.start()
    .then(function() {
      st.ok(registerPrivateOk, 'private send procedure registered');
      return registeredProcedure([],
        { message: message },
        { wildcards: [license, authId, thread] }
      );
    })
    .then(function() {
      st.ok(publishOk, 'message published');
      st.ok(createOk, 'message stored in db');
      return tester.stop();
    });
  });

  t.test('operator send undefined message', function(st) {
    var license = '12345';
    var authId = '54321';
    var thread = '42';

    var registerPrivateOk = false;
    var registeredProcedure = null;
    var publishOk = false; // should stay false
    var createOk = false; // should stay false

    function register(url, fn, options) {
      if (url === 'fr.saio.api.private.license..id..message.send.') {
        registeredProcedure = fn;
        registerPrivateOk = true;
      }
      return when.resolve();
    }

    function publish(url, args, kwargs) {
      if (url === 'fr.saio.api.public.license.' + license + '.id.' + thread + '.message') {
        publishOk = true;
      }
      return when.resolve();
    }

    function create(instance) {
      createOk = true;
      return when.resolve();
    }

    Config.__set__('path', stubPath('../test/helpers/configComplete.json'));
    MessageService.__set__('Config', Config);
    MessageService.__set__('Wsocket', stubWs(register, publish));
    MessageService.__set__('Db', stubDb(create));

    var tester = new Tester(MessageService, {});
    return tester.start()
    .then(function() {
      st.ok(registerPrivateOk, 'private send procedure registered');
      return when.try(function() {
        return registeredProcedure([],
          {},
          { wildcards: [license, authId, thread] }
        );
      });
    })
    .then(function() {
      st.fail('call to private send should have failed');
      return when.resolve();
    })
    .catch(function(err) {
      st.equals(err.message, 'invalid message');
    })
    .then(function() {
      st.notOk(publishOk, 'message not published');
      st.notOk(createOk, 'message not stored in db');
      return tester.stop();
    });
  });

  t.test('operator send a json message (fail expected)', function(st) {
    var license = '12345';
    var message = { key0: 'val0', key1: 'val1' };
    var authId = '54321';
    var thread = '42';

    var registerPrivateOk = false;
    var registeredProcedure = null;
    var publishOk = false; // should stay false
    var createOk = false; // should stay false

    function register(url, fn, options) {
      if (url === 'fr.saio.api.private.license..id..message.send.') {
        registeredProcedure = fn;
        registerPrivateOk = true;
      }
      return when.resolve();
    }

    function publish(url, args, kwargs) {
      if (url === 'fr.saio.api.public.license.' + license + '.id.' + thread + '.message') {
        publishOk = true;
      }
      return when.resolve();
    }

    function create(instance) {
      createOk = true;
      return when.resolve();
    }

    Config.__set__('path', stubPath('../test/helpers/configComplete.json'));
    MessageService.__set__('Config', Config);
    MessageService.__set__('Wsocket', stubWs(register, publish));
    MessageService.__set__('Db', stubDb(create));

    var tester = new Tester(MessageService, {});
    return tester.start()
    .then(function() {
      st.ok(registerPrivateOk, 'private send procedure registered');
      return when.try(function() {
        return registeredProcedure([],
          { message: message },
          { wildcards: [license, authId, thread] }
        );
      });
    })
    .then(function() {
      st.fail('call to private send should have failed');
      return when.resolve();
    })
    .catch(function(err) {
      st.equals(err.message, 'invalid message');
    })
    .then(function() {
      st.notOk(publishOk, 'message not published');
      st.notOk(createOk, 'message not stored in db');
      return tester.stop();
    });
  });
});
