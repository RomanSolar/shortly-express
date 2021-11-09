const express = require('express');
const { Sessions } = require('../models');
const utils = require('../lib/hashUtils');

// - read parsed cookie
// - lookup user data
// - assign object to session property of request
//   - what info do we need to store?
//   - notes:
//     - incoming req with no cookies should create new session
//     - new session needs unique hash and
//     - session should be stored in sessions database
//     - response should include cookie/unique hash
//     - if inc req has cookie, make sure cookie is valid
//     - if not valid, what do we do?


/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
module.exports.createSession = (req, res, next) => {
  if (!req.cookies.shortlyid) {
    return sessionGenerator(req, res).then(next);
  }
  return Sessions.get({hash: req.cookies.shortlyid})
    .then(session => {
      if (!session) {
        var hash = req.cookies.shortlyid;
        delete req.cookies.shortlyid;

        return sessionGenerator(req, res).then(next);
      }
      var user = session.user && {
        id: session.user.id,
        username: session.user.username
      };
      req.session = {user, userId: session.userId, hash: session.hash};
      next();
    });
};
/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

// makes a new session and adds to database
// return session id
sessionGenerator = function(req, res) {
  let data = utils.createRandom32String();
  let hash = utils.createHash(data);
  return Sessions.create(hash)
    .then(() => {
      req.cookies.shortlyid = hash;
      res.cookie('shortlyid', hash);
      req.session = {hash};
    });
};


/*
- [ ] Session generator in `auth.js`
  - [ ] Access parsed `cookies` on the request
    If none:
    - [ ] Generate a session with a unique hash
    - [ ] Store the hash in the `sessions` database
    - [ ] Set a cookie in the response header
    - [ ] Goto 'If in database:'
    If in database:
    - [ ] Retrieve user data related to session from database
    - [ ] Assign an object of user info to a `session` property on the request
    Else:
    - [ ] Clear cookie
    - [ ] Goto 'If none:'
*/
