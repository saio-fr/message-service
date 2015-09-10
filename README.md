message-service
===============
Live-chat service for communication between visitors and opertors. It allows one thread per visitor of a company,
operators of that company can send & receive messages of those threads.

Procedures :
------------
**fr.saio.api.public.license.[license].id.[authId].message.send.[thread]** :  
Public procedure for a visitor to send a message to his own thread.

* [license] : license of the company
* [authId] : authId of the sender (the visitor)
* [thread] : authId of the sender
* `kwargs.message : String`
* `return Boolean` true if message published & saved

**fr.saio.api.private.license.[license].id.[authId].message.send.[thread]** :  
Private procedure for an operator to send a message to a visitor's thread.

* [license] : license of the company
* [authId] : authId of the sender (the operator)
* [thread] : authId of the visitor
* `kwargs.message : String`
* `return Boolean` true if message published & saved

Events :
--------
**fr.saio.api.public.license.[license].id.[thread].message** :  
Channel to receive messages of a thread.  
*Note: Only the visitor who has `authId == [thread]` and operators who have `license == [license]` should be authorized to subscribe to this channel.*

* [license] : license of the company
* [thread] : authId of the visitor
* `kwargs.message : String`
* `kwargs.sender : String` authId of the sender
* `kwargs.date : Integer` when the message was sent, time in ms since unix epoch (01/01/1970 0h UTC)

Config :
--------
The config file must be located at **./config/config.json** when starting the service.

```js
{
  "db": {
    "dialect": String,
    "host": String,
    "port": String,
    "user": String,
    "password": String,
    "dbname": String
  },

  "ws": {
    "url": String,
    "realm": String,
    "authId": String,
    "password": String
  },
}
```

Options :
---------
Runtime options that complete or overwrite static configuration :  
* `--ws-url : config.ws.url`  
* `--ws-realm : config.ws.realm`  
* `--ws-authId : config.ws.authId`  
* `--ws-password : config.ws.password`  
* `--db-dialect : config.db.dialect`  
* `--db-host : config.db.host`  
* `--db-port : config.db.port`  
* `--db-dbname : config.db.dbname`  
* `--db-user : config.db.user`  
* `--db-password : config.db.password`  

Install & run the service :
---------------------------
```bash
$ cd path/to/message-service/package.json
$ npm install
# config parsed from ./config/config.json
$ npm start -- [--options]
```

Test :
------
```bash
$ npm install

# unit tests :
$ npm test

# integration tests :
# you need to have Docker installed
$ npm run test.integration

# to stop the containers & remove the containers & images
# created by the integration test :
$ npm run test.integration.clean
```
