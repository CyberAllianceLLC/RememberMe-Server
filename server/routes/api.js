var express = require('express');
var router = express.Router();

var lib = require('../lib/index.js');
var mid = lib.middleware;

// * = Authentication required

/*===== Users =====*/
//DONE: POST newUser <username> <email> <password>
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

//DONE: POST *newPassword (session_id) (user_id) <password> <new_password>
router.post('/newPassword', mid.auth, function (req, res, next) {
  var ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(',')[0].trim();
  lib.users.newPassword(ip, req.auth, req.body).then(function (data) {
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
  })
});

//DONE: POST *newEmail (user_id) <email>
router.post('/newEmail', mid.auth, function (req, res, next) {
  lib.users.newEmail(req.auth, req.body).then(function (data) {
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

//DONE: POST *newUsername (user_id) <new_username>
router.post('/newUsername', mid.auth, function (req, res, next) {
  lib.users.newUsername(req.auth, req.body).then(function (data) {
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

//DONE: POST loginUser (session_id) <email> <password>
router.post('/loginUser', function (req, res, next) {
  var ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(',')[0].trim();
  lib.users.loginUser(ip, req.body).then(function (result) {
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
  });
});

//DONE: GET *getUserInfo (user_id)
router.get('/getUserInfo', mid.auth, function (req, res, next) {
  lib.users.getUserInfo(req.auth).then(function (data) {
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

//DONE: POST sendRecoveryEmail <email>
router.post('/sendRecoveryEmail', function (req, res, next) {
  lib.users.sendRecoveryEmail(req.body).then(function (data) {
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

//DONE: POST enterRecoveryKey (session_id) <user_id> <new_password> <recovery_key>
router.post('/enterRecoveryKey', function (req, res, next) {
  var ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(',')[0].trim();
  lib.users.enterRecoveryKey(ip, req.body).then(function (data) {
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
  })
});

//DONE: POST verifyNewEmail <user_id> <new_email> <recovery_key>
router.post('/verifyNewEmail', function (req, res, next) {
  lib.users.verifyNewEmail(req.body).then(function (data) {
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

//TODO: POST *removeUser (user_id) <password>

/*===== Content =====*/


module.exports = router;
