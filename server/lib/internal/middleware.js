var q = require('q');
var joi = require('joi');
var jwt = require('jsonwebtoken');
var _ = require('lodash');

var lib = require('../index.js');

var middleware = {};

//DONE: auth
middleware.auth = function (req, res, next) {
  return q.fcall(function () {
    // decode auth token
    var authToken = _.replace(req.headers['authorization'], 'Bearer ', '');
    var decoded = jwt.verify(authToken, lib.config.JWT);

    // verify token type
    joi.assert(decoded.type, 'auth');

    // Check if user has permission to this address
    var address = _.replace(req.url, '/', '');
    joi.assert(address, joi.string().valid(decoded.scope).required());
    return decoded;
  }).then(function (data) {
    req.auth = data;
    next();
  }).catch(function (error) {
    res.json({
      success: false,
      response: 'authentication failed'
    });
  });
};

module.exports = middleware;