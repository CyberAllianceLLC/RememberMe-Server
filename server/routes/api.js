var express = require('express');
var router = express.Router();

var lib = require('../lib/index.js');
var mid = lib.middleware;

// * = Authentication required

/*===== Users =====*/
//CHECK: POST newUser <username> <email> <password>
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
    res.json({
      success: false,
      response: 'request failed'
    });
  })
});

//CHECK: POST *newEmail (user_id) <email>
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
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//DONE: POST *getUserInfo (user_id)
router.post('/getUserInfo', mid.auth, function (req, res, next) {
  lib.users.getUserInfo(req.auth).then(function (data) {
    res.json({
      success: true,
      response: data
    });
  }).catch(function (error) {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//CHECK: POST sendRecoveryEmail <email>
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
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//DONE: POST *removeUser (user_id) <password>
router.post('/removeUser', mid.auth, function (req, res, next) {
  lib.users.removeUser(req.auth, req.body).then(function (data) {
    res.json({
      success: true,
      result: data
    });
  }).catch(function (error) {
    res.json({
      success: false,
      result: 'request failed'
    });
  });
});

/*===== Content =====*/
//DONE: POST *newContent (user_id) <content_type> <picture> <title> <description>
router.post('/newContent', mid.auth, function (req, res, next) {
  lib.content.newContent(req.auth, req.body).then(function (data) {
    res.json({
      success: true,
      result: data
    });
  }).catch(function (error) {
    res.json({
      success: false,
      result: 'request failed'
    });
  });
});

//DONE: POST *getContent (user_id) <[content_id]>
router.post('/getContent', mid.auth, function (req, res, next) {
  lib.content.getContent(req.auth, req.body).then(function (data) {
    res.json({
      success: true,
      result: data
    });
  }).catch(function (error) {
    res.json({
      success: false,
      result: 'request failed'
    });
  });
});

//DONE: POST *getContentByType (user_id) <content_type>
router.post('/getContentByType', mid.auth, function (req, res, next) {
  lib.content.getContentByType(req.auth, req.body).then(function (data) {
    res.json({
      success: true,
      result: data
    });
  }).catch(function (error) {
    res.json({
      success: false,
      result: 'request failed'
    });
  });
});

//DONE: POST *updateContent (user_id) <content_id> <content_type> <picture> <title> <description>
router.post('/updateContent', mid.auth, function (req, res, next) {
  lib.content.updateContent(req.auth, req.body).then(function (data) {
    res.json({
      success: true,
      result: data
    });
  }).catch(function (error) {
    res.json({
      success: false,
      result: 'request failed'
    });
  });
});

//DONE: POST *removeContent (user_id) <[content_id]>
router.post('/removeContent', mid.auth, function (req, res, next) {
  lib.content.removeContent(req.auth, req.body).then(function (data) {
    res.json({
      success: true,
      result: data
    });
  }).catch(function (error) {
    res.json({
      success: false,
      result: 'request failed'
    });
  });
});

/*===== Auth =====*/
//DONE: newAuthToken <refreshToken>
router.post('/newAuthToken', function (req, res, next) {
  lib.auth.newAuthToken(req.body).then(function (data) {
    res.json({
      success: true,
      response: data
    });
  }).catch(function (error) {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//DONE: *getUserTokenInfo (user_id)
router.post('/getUserTokenInfo', mid.auth, function (req, res, next) {
  lib.auth.getUserTokenInfo(req.auth).then(function (data) {
    res.json({
      success: true,
      response: data
    });
  }).catch(function (error) {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//DONE: *removeToken (user_id) <[token_id]>
router.post('/removeToken', mid.auth, function (req, res, next) {
  lib.auth.removeToken(req.auth, req.body).then(function (data) {
    res.json({
      success: true,
      response: data
    });
  }).catch(function (error) {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

module.exports = router;
