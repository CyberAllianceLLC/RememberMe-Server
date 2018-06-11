var q = require('q');
var joi = require('joi');
var shortid = require('shortid');
var crypto = require('crypto');

var lib = require('../index.js');
var knex = lib.config.DB;

var auth = {};

//TODO: newAuthToken <refreshToken>
//TODO: newApiRefreshToken <apiToken>
//TODO: *getUserTokenInfo (user_id)
//TODO: *removeTokens (user_id) <[token_id]>

module.exports = auth;