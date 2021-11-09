const util = require('util');

module.exports = (db) => {
  if (!db.queryAsync) {
    db.connectAsync = util.promisify(db.connect);
    db.queryAsync = util.promisify(db.query);
  }
  // Create links table
  return db.queryAsync(`
    CREATE TABLE IF NOT EXISTS links (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      url VARCHAR(255),
      baseUrl VARCHAR(255),
      code VARCHAR(5),
      title VARCHAR(255),
      visits INT NOT NULL DEFAULT 0
    );`)
    .then(() => {
      // Create clicks table
      return db.queryAsync(`
        CREATE TABLE IF NOT EXISTS clicks (
          id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
          linkId INT
        );`);
    })
    .then(() => {
      // Create users table
      return db.queryAsync(`
        CREATE TABLE IF NOT EXISTS users (
          id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(40) UNIQUE,
          password VARCHAR(64),
          salt VARCHAR(64)
        );`);
    })
    .then(() => {
      // Create sessions table
      return db.queryAsync(`
        CREATE TABLE IF NOT EXISTS sessions (
          id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
          hash VARCHAR(64),
          userId INT
        )`);
    })
    .catch(err => {
      console.log(err);
    });
};
