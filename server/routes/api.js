var express = require('express');
var router = express.Router();

var lib = require('../lib/index.js');
var mid = lib.middleware;

/*===== Users =====*/
//CHECK: newUser <username> <email> <password>
router.post('/newUser', function (req, res, next) {
  lib.users.newUser(req.body).then(function (data) {
    res.json({
      success: true,
      response: data
    });
  }).catch(function (error) {
    console.log(error);
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//CHECK: loginUser (session_id) <email> <password>
router.post('/loginUser', function(req, res, next) {
  lib.users.loginUser(req.ip, req.body).then(function (result) {
    res.json({
      success: true,
      response: result
    });
  }).catch(function (error) {
    console.log(error);
    res.json({
      success: false,
      response: 'request failed'
    });
  })
});

//CHECK: getUserInfo <[user_id]>
router.post('/getUserInfo', function(req, res, next) {
  lib.users.getUserInfo(req.body).then(function (data) {
    res.json({
      success: true,
      response: data
    });
  }).catch(function (error) {
    console.log(error);
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//TODO: sendRecoveryEmail <email>
//TODO: enterRecoveryKey (session_id) <user_id> <new_password> <recovery_key>
//TODO: *getUserInfo (user_id)
//TODO: *newEmail (user_id) <email>
//TODO: verifyNewEmail <user_id> <new_email> <recovery_key>
//TODO: *removeUser (user_id) <password>
//TODO: *newPassword (session_id) (user_id) <password> <new_password>

/*===== Content =====*/


module.exports = router;
