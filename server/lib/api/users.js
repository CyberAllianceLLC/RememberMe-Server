var q = require('q');
var joi = require('joi');
var shortid = require('shortid');
var crypto = require('crypto');
var nodemailer = require('nodemailer');

var lib = require('../index.js');
var knex = lib.config.DB;

//var nm = nodemailer.createTransport(lib.config.SMTP);

/*nm.verify(function(error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log('Server is ready to take our messages');
  }
});*/

var users = {};

//DONE: newUser <username> <email> <password>
users.newUser = function (query) {
  return q.fcall(function () {
    joi.assert(query, {
      username: joi.string().min(3).max(20).required(),
      email: joi.string().email().required(),
      password: joi.string().min(6).max(400).required()
    });
    return {
      username: query.username,
      email: query.email,
      password: query.password
    }
  }).then(function (data) {
    var salt = crypto.randomBytes(64).toString('base64');
    var passwordHash = crypto.pbkdf2Sync(data.password, salt, 50000, 256, 'sha256').toString('base64');
    var recovery_key = crypto.randomBytes(64).toString('base64');
    return knex('users')
    .insert({
      user_id: shortid.generate(),
      username: data.username,
      email: data.email,
      salt: salt,
      password: passwordHash,
      recovery_key: recovery_key
    })
    .returning([
      'user_id',
      'username',
      'email',
      'recovery_key'
    ]);
  }).then(function (user) {
    joi.assert(user, joi.array().min(1).required());
    var user_id = user[0].user_id;
    var username = user[0].username;
    var email = user[0].email;
    var recovery_key = user[0].recovery_key;
    return {
      user_id: user_id,
      username: username,
      email: email,
      recovery_key: recovery_key
    };
    /*return q.Promise(function (resolve, reject) {
      var mailOptions = {
        to: email,
        from: 'Philip Smith <smithp1992@gmail.com>',
        subject: 'Verify Email - {website name}',
        text: 'An email verification has been requested for your RememberMe account. \n \n To verify your email for ' +
        'RememberMe, please visit this link: \n http://localhost:3000/verifyEmail/'+ encodeURIComponent(user_id) +
        '/'+ encodeURIComponent(recovery_key) +'/'+ encodeURIComponent(email) + '\n \n Thank you for using {website name}!'
      };
      nm.sendMail(mailOptions, function(error, info) {
        if(error){
          reject(error);
        }else{
          resolve(info);
        }
      });
    });*/
  }).then(function () {
    return 'email sent';
  });
};

//DONE: loginUser (session_id) <email> <password>
users.loginUser = function (session_id, query) {
  return q.fcall(function () {
    joi.assert(query, {
      email: joi.string().email().required(),
      password: joi.string().min(6).max(400).required()
    });
    return {
      email: query.email,
      password: query.password
    };
  }).then(function (data) {
    return knex('users')
    .select([
      'user_id',
      'salt',
      'password'
    ])
    .where('verified', '=', true)
    .where('email', '=', data.email)
    .where('login_attempts', '<=', 6)
    .then(function (user) {
      joi.assert(user, joi.array().min(1).required());
      // verify passwords are correct
      var passwordHash = crypto.pbkdf2Sync(data.password, user[0].salt, 50000, 256, 'sha256').toString('base64');
      if (user[0].password === passwordHash) {
        // user successfully logged in
        return [{
          user_id: user[0].user_id
        }];
      } else {
        // user failed login: add 1 to login attempt
        knex('users')
        .update({
          login_attempts: knex.raw('login_attempts + 1')
        })
        .where('user_id', '=', user[0].user_id)
        .then(function (result) {
          throw new Error('login failed');
        });
      }
    })
    .then(function (data) {
      joi.assert(data, joi.array().min(1).required());
      // get new jwt token for user
      return lib.util.newRefreshToken({
        user_id: data[0].user_id,
        holder: data[0].user_id,
        name: session_id,
        scope: lib.config.TOKENS.user_scope
      });
    });
  });
};

//CHECK: *getUserInfo (user_id)
users.getUserInfo = function (query) {
  return q.fcall(function () {
    joi.assert(query, {
      user_id: joi.string().max(20).required()
    });
    return {
      user_id: query.user_id
    };
  }).then(function (data) {
    knex('users')
    .select([
      'user_id',
      'username',
      'email',
      'created_at',
      'updated_at'
    ])
    .where('user_id', '=', data.username);
  }).then(function (data) {
    joi.assert(data, joi.array().min(1).required());
    return data[0];
  });
};

//CHECK: sendRecoveryEmail <email>
users.sendRecoveryEmail = function (query) {
  return q.fcall(function () {
    joi.assert(query, {
      email: joi.string().email().required()
    });
    return {
      email: query.email
    };
  }).then(function (data) {
    return knex('users')
    .update({
      email_attempts: knex.raw('email_attempts + 1')
    })
    .where('email', '=', data.email)
    .where('email_attempts', '<=', 6)
    .returning([
      'user_id',
      'username',
      'email',
      'recovery_key'
    ]);
  }).then(function (user) {
    joi.assert(user, joi.array().min(1).required());
    var user_id = user[0].user_id;
    var email = user[0].email;
    var recovery_key = user[0].recovery_key;
    return {
      user_id: user,
      email: email,
      recovery_key: recovery_key
    };
    /*return q.Promise(function (resolve, reject) {
      var mailOptions = {
        to: email,
        from: 'Philip Smith <smithp1992@gmail.com>',
        subject: 'Verify Email - {website name}',
        text: 'An email verification has been requested for your RememberMe account. \n \n To verify your email for ' +
        'RememberMe, please visit this link: \n http://localhost:3000/verifyEmail/'+ encodeURIComponent(user_id) +
        '/'+ encodeURIComponent(recovery_key) +'/'+ encodeURIComponent(email) + '\n \n Thank you for using {website name}!'
      };
      nm.sendMail(mailOptions, function(error, info) {
        if(error){
          reject(error);
        }else{
          resolve(info);
        }
      });
    });*/
  }).then(function (data) {
    return 'email sent';
  });
};

//CHECK: enterRecoveryKey (session_id) <user_id> <new_password> <recovery_key>
users.enterRecoveryKey = function(session_id, query) {
  return q.fcall(function () {
    joi.assert({
      user_id: joi.string().max(20).required(),
      new_password: joi.string().min(6).max(400).required(),
      recovery_key: joi.string().max(100).required()
    });
    return {
      user_id: query.user_id,
      new_password: query.new_password,
      recovery_key: query.recovery_key
    };
  }).then(function (data) {
    var salt = crypto.randomBytes(64).toString('base64');
    var passwordHash = crypto.pbkdf2Sync(data.new_password, salt, 50000, 256, 'sha256').toString('base64');
    var new_recovery_key = crypto.randomBytes(64).toString('base64');
    return knex('users')
    .insert({
      verified: true,
      salt: salt,
      password: passwordHash,
      recovery_key: new_recovery_key
    })
    .where('user_id', '=', data.user_id)
    .where('recovery_key', '=', data.recovery_key)
    .select([
      'user_id'
    ]);
  }).then(function (data) {
    joi.assert(data, joi.array().min(1).required());
    // Delete old user sessions
    return lib.util.removeSessions(data[0].user_id).then(function () {
      // Create new refresh token
      return lib.util.newRefreshToken({
        user_id: data[0].user_id,
        holder: data[0].user_id,
        name: session_id,
        scope: lib.config.TOKENS.user_scope
      });
    });
  });
};

//TODO: *getUserInfo (user_id)
//TODO: *newEmail (user_id) <email>
//TODO: verifyNewEmail <user_id> <new_email> <recovery_key>
//TODO: *removeUser (user_id) <password>
//TODO: *newPassword (session_id) (user_id) <password> <new_password>

module.exports = users;