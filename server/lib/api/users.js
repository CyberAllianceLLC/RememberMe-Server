var q = require('q');
var joi = require('joi');
var shortid = require('shortid');
var crypto = require('crypto');
var nodemailer = require('nodemailer');

var lib = require('../index.js');
var knex = lib.config.DB;

var nm = nodemailer.createTransport(lib.config.SMTP);

nm.verify(function (error) {
  if (error) {
    console.log(error);
  } else {
    console.log('Server is ready to take our messages');
  }
});

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
      'email',
      'recovery_key'
    ]);
  }).then(function (data) {
    joi.assert(data, joi.array().min(1).required());
    // Send email to user
    return q.Promise(function (resolve, reject) {
      var mailOptions = {
        to: data[0].email,
        from: 'RememberMe <noreply@remembermeapp.io>',
        subject: 'Verify Email - RememberMe',
        text: 'An email verification has been requested for your RememberMe account. \n \n To verify your email for ' +
        'RememberMe, please visit this link: \n' + lib.config.BASE_URL + '/verifyEmail/' + encodeURIComponent(data[0].user_id) +
        '/' + encodeURIComponent(data[0].recovery_key) + '/' + encodeURIComponent(data[0].email) + '\n \n Thank you for using RememberMe!'
      };
      nm.sendMail(mailOptions, function(error, info) {
        if(error){
          reject(error);
        }else{
          resolve(info);
        }
      });
    });
  }).then(function () {
    return 'Email sent';
  });
};

//DONE: *newPassword (session_id) (user_id) <password> <new_password>
users.newPassword = function (session_id, auth, query) {
  return q.fcall(function () {
    joi.assert(query, {
      password: joi.string().min(6).required(),
      new_password: joi.string().min(6).required()
    });
    return {
      user_id: auth.user_id,
      password: query.password,
      new_password: query.new_password
    };
  }).then(function (data) {
    var new_salt = crypto.randomBytes(64).toString('base64');
    var new_password_hash = crypto.pbkdf2Sync(data.new_password, new_salt, 50000, 256, 'sha256').toString('base64');
    var new_recovery_key = crypto.randomBytes(64).toString('base64');
    return knex('users')
    .select([
      'salt'
    ])
    .where('user_id', '=', data.user_id)
    .then(function (user) {
      joi.assert(user, joi.array().min(1).required());
      var passwordHash = crypto.pbkdf2Sync(data.password, user[0].salt, 50000, 256, 'sha256').toString('base64');
      return knex('users')
      .update({
        salt: new_salt,
        password: new_password_hash,
        recovery_key: new_recovery_key,
        updated_at: knex.raw('now()')
      })
      .where('user_id', '=', data.user_id)
      .where('password', '=', passwordHash)
      .returning([
        'user_id'
      ]);
    }).then(function (data) {
      joi.assert(data, joi.array().min(1).required());
      // get new jwt token for user
      return lib.util.newRefreshToken({
        user_id: data[0].user_id,
        session: session_id,
        scope: lib.config.TOKENS.scope
      });
    });
  });
};

//CHECK: *newEmail (user_id) <email>
users.newEmail = function (auth, query) {
  return q.fcall(function () {
    joi.assert(query, {
      new_email: joi.string().email().required()
    });
    return {
      user_id: auth.user_id,
      new_email: query.new_email.toLowerCase()
    };
  }).then(function (data) {
    return knex('users')
    .update({
      email_attempts: knex.raw('email_attempts + 1')
    })
    .where('user_id', '=', data.user_id)
    .where('email_attempts', '<=', 6)
    .returning([
      'user_id',
      'recovery_key',
      'email'
    ]).then(function (user) {
      joi.assert(user, joi.array().min(1).required());
      // Send email to user
      return q.Promise(function (resolve, reject) {
        var mailOptions = {
          to: data[0].email,
          from: 'RememberMe <noreply@remembermeapp.io>',
          subject: 'Verify Email - RememberMe',
          text: 'An email verification has been requested for your RememberMe account. \n \n To verify your email for ' +
          'RememberMe, please visit this link: \n' + lib.config.BASE_URL + '/verifyEmail/' + encodeURIComponent(data[0].user_id) +
          '/' + encodeURIComponent(data[0].recovery_key) + '/' + encodeURIComponent(data[0].email) + '\n \n Thank you for using RememberMe!'
        };
        nm.sendMail(mailOptions, function(error, info) {
          if(error){
            reject(error);
          }else{
            resolve(info);
          }
        });
      });
    }).then(function (data) {
      return 'Email sent';
    });
  });
};

//DONE: *newUsername (user_id) <new_username>
users.newUsername = function (auth, query) {
  return q.fcall(function () {
    joi.assert(query, {
      new_username: query.new_username
    });
    return {
      user_id: auth.user_id,
      new_username: query.new_username
    };
  }).then(function (data) {
    return knex('users')
    .update({
      username: data.new_username,
      updated_at: knex.raw('now()')
    })
    .returning([
      'username'
    ])
    .where('user_id', '=', data.user_id);
  }).then(function (data) {
    joi.assert(data, joi.array().min(1).required());
    return 'Username updated';
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
        return knex('users')
        .update({
          login_attempts: knex.raw('login_attempts + 1')
        })
        .where('user_id', '=', user[0].user_id)
        .then(function (error) {
          throw new Error('login failed');
        });
      }
    })
    .then(function (data) {
      joi.assert(data, joi.array().min(1).required());
      // get new jwt token for user
      return lib.util.newRefreshToken({
        user_id: data[0].user_id,
        session: session_id,
        scope: lib.config.TOKENS.scope
      });
    });
  });
};

//DONE: *getUserInfo (user_id)
users.getUserInfo = function (query) {
  return q.fcall(function () {
    return {
      user_id: query.user_id
    };
  }).then(function (data) {
    return knex('users')
    .select([
      'user_id',
      'username',
      'email',
      'created_at',
      'updated_at'
    ])
    .where('user_id', '=', data.user_id);
  }).then(function (data) {
    joi.assert(data, joi.array().min(1).required());
    return data[0];
  });
};

//DONE: sendRecoveryEmail <email>
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
      'email',
      'recovery_key'
    ]);
  }).then(function (data) {
    joi.assert(data, joi.array().min(1).required());
    return q.Promise(function (resolve, reject) {
      var mailOptions = {
        to: data[0].email,
        from: 'RememberMe <noreply@remembermeapp.io>',
        subject: 'Account Recovery - RememberMe',
        text: 'A password reset has been requested for your RememberMe account. \n \n If you did not make this ' +
        'request, you can safely ignore this email. A password reset request can be made by anyone, and it does not ' +
        'indicate that your account is in any danger of being accessed by someone else. \n \n If you do actually want ' +
        'to reset your password, visit this link: \n' + lib.config.BASE_URL + '/newPassword/' +
        encodeURIComponent(data[0].user_id) + '/' + encodeURIComponent(data[0].recovery_key) + '\n \n Thank you ' +
        'for using RememberMe!'
      };
      nm.sendMail(mailOptions, function(error, info) {
        if(error){
          reject(error);
        }else{
          resolve(info);
        }
      });
    });
  }).then(function (data) {
    return 'Email sent';
  });
};

//DONE: verifyRecoveryEmail (session_id) <user_id> <new_password> <recovery_key>
users.verifyRecoveryEmail = function (session_id, query) {
  return q.fcall(function () {
    joi.assert(query, {
      user_id: joi.string().max(20).required(),
      new_password: joi.string().min(6).max(100).required(),
      recovery_key: joi.string().required()
    });
    return {
      session_id: session_id,
      user_id: query.user_id,
      new_password: query.new_password,
      recovery_key: query.recovery_key
    };
  }).then(function (data) {
    //create new salt
    var new_salt = crypto.randomBytes(64).toString('base64');
    //create new password hash
    var new_passwordHash = crypto.pbkdf2Sync(data.new_password, new_salt, 50000, 256, 'sha256').toString('base64');
    //create new recovery key
    var new_recovery_key = crypto.randomBytes(64).toString('base64');
    console.log(data);
    return knex('users')
    .update({
      verified: true,
      salt: new_salt,
      password: new_passwordHash,
      recovery_key: new_recovery_key,
      updated_at: knex.raw('now()')
    })
    .where('recovery_key', '=', data.recovery_key)
    .where('user_id', '=', data.user_id)
    .returning([
      'user_id'
    ]);
  }).then(function (data) {
    joi.assert(data, joi.array().min(1).required());
    //delete old session tokens
    return lib.util.removeSessions({user_id: data[0].user_id}).then(function () {
      //create new refresh token
      return lib.util.newRefreshToken({
        user_id: data[0].user_id,
        session: session_id,
        scope: lib.config.TOKENS.scope
      });
    });
  });
};

//DONE: enterRecoveryKey (session_id) <user_id> <new_password> <recovery_key>
users.enterRecoveryKey = function(session_id, query) {
  return q.fcall(function () {
    joi.assert(query, {
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
    .update({
      verified: true,
      salt: salt,
      password: passwordHash,
      recovery_key: new_recovery_key
    })
    .where('user_id', '=', data.user_id)
    .where('recovery_key', '=', data.recovery_key)
    .returning([
      'user_id'
    ]);
  }).then(function (data) {
    joi.assert(data, joi.array().min(1).required());
    // Delete old user sessions
    return lib.util.removeSessions({user_id: data[0].user_id}).then(function () {
      // Create new refresh token
      return lib.util.newRefreshToken({
        user_id: data[0].user_id,
        session: session_id,
        scope: lib.config.TOKENS.scope
      });
    });
  });
};

//DONE: verifyNewEmail <user_id> <new_email> <recovery_key>
users.verifyNewEmail = function (query) {
  return q.fcall(function () {
    joi.assert(query, {
      user_id: joi.string().max(20).required(),
      new_email: joi.string().email().required(),
      recovery_key: joi.string().required()
    });
    return {
      user_id: query.user_id,
      new_email: query.new_email,
      recovery_key: query.recovery_key
    };
  }).then(function (data) {
    // Verify user
    return knex('users')
    .update({
      email: data.new_email,
      verified: true,
      recovery_key: crypto.randomBytes(64).toString('base64'),
      updated_at: knex.raw('now()')
    })
    .where('user_id', '=', data.user_id)
    .where('recovery_key', '=', data.recovery_key)
    .returning([
      'user_id'
    ]);
  }).then(function (data) {
    joi.assert(data, joi.array().min(1).required());
    return 'Email updated';
  });
};

//DONE: *removeUser (user_id) <password>
users.removeUser = function (auth, query) {
  return q.fcall(function () {
    joi.assert(query, {
      password: joi.string().min(6).required()
    });
    return {
      user_id: auth.user_id,
      password: query.password
    };
  }).then(function (data) {
    return knex('users')
    .select([
      'user_id',
      'salt'
    ])
    .where('user_id', '=', data.user_id)
    .then(function (user) {
      joi.assert(user, joi.array().min(1).required());
      var passwordHash = crypto.pbkdf2Sync(data.password, user[0].salt, 50000, 256, 'sha256').toString('base64');
      return knex('users')
      .del()
      .where('user_id', '=', user[0].user_id)
      .where('password', '=', passwordHash)
      .returning([
        'user_id'
      ]);
    }).then(function (data) {
      joi.assert(data, joi.array().min(1).required());
      return 'User deleted';
    });
  });
};

module.exports = users;