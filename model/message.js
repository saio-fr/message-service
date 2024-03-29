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

module.exports = function(sequelize, Datatypes) {
  var model = {
    license: {
      type: Datatypes.STRING,
      allowNull: false
    },
    thread: { // == visitorAuthId
      type: Datatypes.STRING,
      allowNull: false
    },
    sender: {// == visitor/operatorAuthId
      type: Datatypes.STRING,
      allowNull: false
    },
    date: { // when the msg was received by message-service, in ms from unix epoch
      type: Datatypes.BIGINT, // DATE type not used because of UTC/LOCAL issues
      allowNull: false
    },
    message: {
      type: Datatypes.TEXT,
      allowNull: false
    }
  };

  return sequelize.define('Message', model);
};
