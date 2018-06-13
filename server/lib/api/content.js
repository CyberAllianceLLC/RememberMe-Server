var q = require('q');
var joi = require('joi');
var shortid = require('shortid');

var lib = require('../index.js');
var knex = lib.config.DB;

var content = {};

//DONE: *newContent (user_id) <content_type> <picture> <title> <description>
content.newContent = function (auth, query) {
  return q.fcall(function () {
    joi.assert(query, {
      content_type: joi.string().valid(['name', 'note']).insensitive().required(),
      picture: joi.string().max(100000).allow('').default(''),
      title: joi.string().max(100).required(),
      description: joi.string().max(1000).allow('').default('')
    });
    return {
      user_id: auth.user_id,
      content_type: query.content_type.toLowerCase(),
      picture: query.picture,
      title: query.title,
      description: query.description
    };
  }).then(function (data) {
    return knex('contents')
    .insert({
      content_id: shortid.generate(),
      user_id: data.user_id,
      type: data.content_type,
      picture: data.picture,
      title: data.title,
      description: data.description
    })
    .returning([
      'content_id',
      'user_id',
      'type',
      'picture',
      'title',
      'description'
    ]);
  }).then(function (data) {
    joi.assert(data, joi.array().min(1).required());
    return data[0];
  });
};

//DONE: *getContent (user_id) <[content_id]>
content.getContent = function (auth, query) {
  return q.fcall(function () {
    joi.assert(query, {
      content_id: joi.array().items(joi.string().max(20).required()).required()
    });
    return {
      user_id: auth.user_id,
      content_id: query.content_id
    };
  }).then(function (data) {
    return knex('contents')
    .select([
      'content_id',
      'user_id',
      'type',
      'picture',
      'title',
      'description'
    ])
    .whereIn('content_id', data.content_id)
    .where('user_id', '=', data.user_id);
  }).then(function (data) {
    joi.assert(data, joi.array().min(1).required());
    return data;
  });
};

//DONE: *getContentByType (user_id) <content_type>
content.getContentByType = function (auth, query) {
  return q.fcall(function () {
    joi.assert(query, {
      content_type: joi.string().valid(['name', 'note']).insensitive().required()
    });
    return {
      user_id: auth.user_id,
      content_type: query.content_type.toLowerCase()
    };
  }).then(function (data) {
    return knex('contents')
    .select([
      'content_id',
      'user_id',
      'type',
      'picture',
      'title',
      'description'
    ])
    .where('user_id', '=', data.user_id)
    .where('type', '=', data.content_type);
  }).then(function (data) {
    joi.assert(data, joi.array().min(1).required());
    return data;
  });
};

//DONE: *updateContent (user_id) <content_id> <content_type> <picture> <title> <description>
content.updateContent = function (auth, query) {
  return q.fcall(function () {
    joi.assert(query, {
      content_id: joi.string().max(20).required(),
      content_type: joi.string().valid(['name', 'note']).insensitive().required(),
      picture: joi.string().max(10000).allow('').default(''),
      title: joi.string().max(100).required(),
      description: joi.string().max(1000).allow('').default('')
    });
    return {
      user_id: auth.user_id,
      content_id: query.content_id,
      content_type: query.content_type,
      picture: query.picture,
      title: query.title,
      description: query.description
    };
  }).then(function (data) {
    return knex('contents')
    .update({
      type: data.content_type,
      picture: data.picture,
      title: data.picture,
      description: data.description
    })
    .where('user_id', '=', data.user_id)
    .where('content_id', '=', data.content_id)
    .returning([
      'content_id'
    ]);
  }).then(function (data) {
    joi.assert(data, joi.array().min(1).required());
    return 'Content updated'
  });
};

//DONE: *removeContent (user_id) <[content_id]>
content.removeContent = function (auth, query) {
  return q.fcall(function () {
    joi.assert(query, {
      content_id: joi.array().items(joi.string().max(20).required()).required()
    });
    return {
      user_id: auth.user_id,
      content_id: query.content_id
    };
  }).then(function (data) {
    return knex('contents')
    .del()
    .whereIn('content_id', data.content_id)
    .where('user_id', '=', data.user_id)
    .returning([
      'content_id'
    ]);
  }).then(function (data) {
    joi.assert(data, joi.array().min(1).required());
    return 'Content deleted';
  });
};

module.exports = content;