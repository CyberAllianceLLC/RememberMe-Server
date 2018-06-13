var q = require('q');

var knex = require('knex')({
  client: 'pg',
  connection: ((process.env['DSN']) ? process.env['DSN'] : 'postgres://postgres:@db:5432/postgres'),
  debug: (process.env['NODE_ENV'] === 'development')
});

/*Models*/

q.fcall(function () {
  // Initialize database
  return knex.raw('CREATE EXTENSION pg_trgm');
}).then(function () {
  return knex.schema.createTable('users', function (table) {
    table.string('user_id', 20).notNullable().primary().unique();
    table.string('username', 20).notNullable().unique().index();
    table.string('email', 50).notNullable().unique().index();
    table.boolean('verified').notNullable().defaultTo(false);
    table.string('salt', 100).notNullable();
    table.string('password', 400).notNullable();
    table.string('recovery_key', 100).notNullable();
    table.integer('login_attempts').notNullable().defaultTo(0);
    table.integer('email_attempts').notNullable().defaultTo(0);
    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('now()'));
    table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()')).index();
  })
}).then(function () {
  return knex.schema.createTable('tokens', function (table) {
    table.string('token_id', 20).notNullable().primary().unique();
    table.string('user_id', 20).notNullable().references('users.user_id').onDelete('CASCADE').index();
    table.enu('type', ['refresh', 'api']).notNullable();
    table.string('session', 100).notNullable();
    table.specificType('scope', 'varchar(50)[]').notNullable().defaultTo('{}');
    table.timestamp('expires').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()')).index();
  });
}).then(function () {
  return knex.schema.createTable('contents', function (table) {
    table.string('content_id', 20).notNullable().primary().unique();
    table.string('user_id', 20).notNullable().references('users.user_id').onDelete('CASCADE').index();
    table.enu('type', ['name', 'note']).notNullable().index();
    table.string('picture', 100000).notNullable().defaultTo('');
    table.string('title', 100).notNullable();
    table.string('description', 1000).notNullable().defaultTo('');
    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('now()'));
    table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()')).index();
  });
}).catch(function (error) {
  console.log(error);
}).finally(function () {
  process.exit(0);
});
