var q = require('q');
var joi = require('joi');
var shortid = require('shortid');
var jwt = require('jsonwebtoken');

var lib = require('../index.js');
var knex = lib.config.DB;

var util = {};

//DONE: newRefreshToken <user_id> <holder> <name> <scope>
util.newRefreshToken = function (query) {
  return q.fcall(function () {
    joi.assert(query, {
      user_id: joi.string().min(3).max(20).required(),
      holder: joi.string().token().min(3).max(20).required(),
      name: joi.string().max(100).required(),
      scope: joi.array().items(joi.string().valid(lib.config.TOKENS.user_scope).required()).unique().required()
    });
    return {
      user_id: query.user_id,
      holder: query.holder,
      name: query.name,
      scope: query.scope
    };
  }).then(function (data) {
    return knex('tokens')
    .insert({
      token_id: shortid.generate(),
      user_id: data.user_id,
      holder: data.holder,
      type: 'refresh',
      name: data.name,
      scope: data.scope,
      expires: knex.raw('now() + (make_interval(secs => 1) * ?) ', [lib.config.TOKENS.refreshTokenExpire])
    })
    .returning([
      'token_id',
      'user_id',
      'holder',
      'name',
      'scope'
    ]);
  }).then(function (token) {
    joi.assert(token, joi.array().min(1).required());
    var refreshToken = jwt.sign({
      token_id: token[0].token_id,
      user_id: token[0].user_id,
      holder: token[0].holder,
      name: token[0].name,
      scope: token[0].scope
    }, lib.config.JWT, {
      expiresIn: lib.config.TOKENS.refreshTokenExpire
    });

    var authToken = jwt.sign({
      token_id: token[0].token_id,
      user_id: token[0].user_id,
      holder: token[0].holder,
      type: 'auth',
      name: token[0].name,
      scope: token[0].scope
    }, lib.config.JWT, {
      expiresIn: lib.config.TOKENS.refreshTokenExpire
    });
    return {
      refreshToken: refreshToken,
      authToken: authToken
    };
  });
};

//CHECK: removeSessions <user_id>
util.removeSessions = function (query) {
  return q.fcall(function () {
    joi.assert(query, {
      user_id: joi.string().min(3).max(20).required()
    });
    return {
      user_id: query.user_id
    };
  }).then(function (data) {
    return knex('tokens')
    .del()
    .where('user_id', '=', data.user_id)
    .where('holder', '=', data.user_id)
    .where('type', '=', 'refresh');
  }).then(function () {
    return 'sessions removed';
  });
};

module.exports = util;