var q = require('q');
var _ = require('lodash');
var Cron = require('cron').CronJob;

var lib = require('../index.js');
var knex = lib.config.DB;

// Put in only one worker
if (process.env.DYNO === 'web.1') {

  //CHECK: reset email_attempt and login_attempt (1 hour)
  new Cron('0 1 * * * *', function () {
    q.fcall(function () {
      return knex('users')
      .update({
        email_attempts: 0,
        login_attempts: 0
      })
      .where('email_attempts', '>', 0)
      .orWhere('login_attempts', '>', 0);
    }).catch(function (error) {
      console.log('Error resetting email and/or login attempts.');
    });
  }, null, true, 'America/Los_Angeles');

  //CHECK: delete unverified new accounts (1 day)
  new Cron('0 0 1 * * *', function () {
    q.fcall(function () {
      return knex('users')
      .del()
      .where('verified', '=', false)
      .whereRaw('created_at < (now() - interval \'1 day\')');
    }).catch(function (error) {
      console.log('Error removing new accounts.');
    });
  }, null, true, 'America/Los_Angeles');

  //CHECK: delete expired tokens (1 day)
  new Cron('0 0 1 * * *', function () {
    q.fcall(function () {
      return knex('tokens')
      .del()
      .whereRaw('expires < now()');
    }).catch(function (error) {
      console.log('Error removing expired tokens.');
    });
  }, null, true, 'America/Los_Angeles');
}