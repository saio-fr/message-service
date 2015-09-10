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

var MessageHandler = function(conversation, sender) {
  this.conversation = conversation;
  this.i = 0; // next msg
  this.completed = false;
  this.failed = false;
  this.sender = sender;
};

// return a message if the sender sends the first msg of the conversation or return undefined
MessageHandler.prototype.init = function() {
  if (this.conversation[0].sender === this.sender) {
    return this.conversation[0].message;
  }
};

// return a message if this sender should say the next message or return undefined
MessageHandler.prototype.receive = function(message, sender) {
  if (this.i >= this.conversation.length) {
    this.failed = true;
    return;
  }

  if (this.conversation[this.i].message !== message ||
      this.conversation[this.i].sender !== sender) {
    this.failed = true;
  }

  ++this.i;
  if (this.i === this.conversation.length) {
    this.completed = true;
    return;
  }

  if (this.conversation[this.i].sender === this.sender) {
    return this.conversation[this.i].message;
  }
};

module.exports = MessageHandler;
