var q = require('q');
var joi = require('joi');
var shortid = require('shortid');
var crypto = require('crypto');

var lib = require('../index.js');
var knex = lib.config.DB;

var content = {};

//TODO: *newContent (user_id) <content_type> <picture> <title> <description>
//TODO: *getContent (user_id) <[content_id]>
//TODO: *getContentByType (user_id) <content_type>
//TODO: *updateContent (user_id) <content_id> <content_type> <picture> <title> <description>
//TODO: *removeContent (user_id) <content_id>

module.exports = content;