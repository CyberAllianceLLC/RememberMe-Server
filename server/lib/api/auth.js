var q = require('q');
var joi = require('joi');
var shortid = require('shortid');
var jwt = require('jsonwebtoken');

var lib = require('../index.js');
var knex = lib.config.DB;

var auth = {};

//DONE: newAuthToken <refreshToken>
auth.newAuthToken = function (query) {
  return q.fcall(function () {
    joi.assert(query, {
      refreshToken: joi.string().required()
    });
    var decoded = jwt.verify(query.refreshToken, lib.config.JWT);
    joi.assert(decoded.type, 'refresh');
    return {
      token_id: decoded.token_id
    };
  }).then(function (data) {
    return knex('tokens')
    .del()
    .where('token_id', '=', data.token_id)
    .where('type', '=', 'refresh')
    .returning([
      'user_id',
      'session',
      'scope'
    ]);
  }).then(function (data) {
    joi.assert(data, joi.array().min(1).required());
    return lib.util.newRefreshToken({
      user_id: data[0].user_id,
      session: data[0].session,
      scope: data[0].scope
    });
  });
};

//DONE: *getUserTokenInfo (user_id)
auth.getUserTokenInfo = function (auth) {
  return q.fcall(function () {
    return {
      user_id: auth.user_id
    };
  }).then(function (data) {
    return knex('tokens')
    .select([
      'token_id',
      'user_id',
      'type',
      'session',
      'scope',
      'expires',
      'created_at'
    ])
    .where('user_id', '=', data.user_id)
    .orderBy('created_at', 'DESC');
  }).then(function (data) {
    return data;
  });
};

//DONE: *removeToken (user_id) <[token_id]>
auth.removeToken = function (auth, query) {
  return q.fcall(function () {
    joi.assert(query, {
      token_id: joi.array().items(joi.string().max(20).required()).required()
    });
    return {
      user_id: auth.user_id,
      token_id: query.token_id
    };
  }).then(function (data) {
    return knex('tokens')
    .del()
    .whereIn('token_id', data.token_id)
    .where('user_id', '=', data.user_id)
    .returning([
      'token_id'
    ]);
  }).then(function (data) {
    joi.assert(data, joi.array().min(1).required());
    return 'Tokens deleted'
  });
};

module.exports = auth;