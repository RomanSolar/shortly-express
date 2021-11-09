const express = require('express');

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
const verifySession = (req, res, next) => {
  req.session.userId ? next() : res.redirect('/login');
};

module.exports = verifySession;
