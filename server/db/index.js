const mysql = require('mysql2');
const createTables = require('./config');
const database = 'shortly';
const util = require('util');

const db = mysql.createConnection(require('../env/config.js').db);
db.connectAsync = util.promisify(db.connect);
db.queryAsync = util.promisify(db.query);

db.connectAsync()
  .then(() => console.log(`Connected to ${database} database as ID ${db.threadId}`))
  .then(() => db.queryAsync(`CREATE DATABASE IF NOT EXISTS ${database}`))
  .then(() => db.queryAsync(`USE ${database}`))
  .then(() => createTables(db));

module.exports = db;
