var config = require('../config.js');

//Configuration
exports.config = {
  JWT: config.JWT,
  TOKENS: {
    authTokenExpire: 60 * 20, //20 minutes
    refreshTokenExpire: 60 * 60 * 24 * 365, //1 year
    scope: [
      'newPassword',
      'newEmail',
      'newUsername',
      'newContent',
      'getUserTokenInfo',
      'getUserInfo',
      'getContent',
      'getContentByType',
      'updateContent',
      'removeUser',
      'removeContent',
      'removeToken'
    ]
  },
  DB: require('knex')({
    client: 'pg',
    connection: config.DB,
    debug: false
  }),
  SMTP: config.SMTP
};

//internal
exports.middleware = require('./internal/middleware.js');
exports.util = require('./internal/util.js');
exports.cronjobs = require('./internal/cronjobs.js');

//api
exports.auth = require('./api/auth.js');
exports.users = require('./api/users.js');
exports.content = require('./api/content.js');