var q = require('q');
var joi = require('joi');
var shortid = require('shortid');
var jwt = require('jsonwebtoken');

var lib = require('../index.js');
var knex = lib.config.DB;

var util = {};

//DONE: newRefreshToken <user_id> <session> <scope>
util.newRefreshToken = function (query) {
  return q.fcall(function () {
    joi.assert(query, {
      user_id: joi.string().min(3).max(20).required(),
      session: joi.string().max(100).required(),
      scope: joi.array().items(joi.string().valid(lib.config.TOKENS.scope).required()).unique().required()
    });
    return {
      user_id: query.user_id,
      session: query.session,
      scope: query.scope
    };
  }).then(function (data) {
    return knex('tokens')
    .insert({
      token_id: shortid.generate(),
      user_id: data.user_id,
      type: 'refresh',
      session: data.session,
      scope: data.scope,
      expires: knex.raw('now() + (make_interval(secs => 1) * ?) ', [lib.config.TOKENS.refreshTokenExpire])
    })
    .returning([
      'token_id',
      'user_id',
      'session',
      'scope'
    ]);
  }).then(function (token) {
    joi.assert(token, joi.array().min(1).required());
    var refreshToken = jwt.sign({
      token_id: token[0].token_id,
      user_id: token[0].user_id,
      session: token[0].session,
      scope: token[0].scope
    }, lib.config.JWT, {
      expiresIn: lib.config.TOKENS.refreshTokenExpire
    });

    var authToken = jwt.sign({
      token_id: token[0].token_id,
      user_id: token[0].user_id,
      type: 'auth',
      session: token[0].session,
      scope: token[0].scope
    }, lib.config.JWT, {
      expiresIn: lib.config.TOKENS.authTokenExpire
    });
    return {
      refreshToken: refreshToken,
      authToken: authToken
    };
  });
};

//DONE: removeSessions <user_id>
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
    .where('type', '=', 'refresh');
  }).then(function () {
    return 'sessions removed';
  });
};

module.exports = util;