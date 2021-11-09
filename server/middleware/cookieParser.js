const express = require('express');
// read and parse cookie from incoming request obj
// assign new obj (parsed cookie) to request.cookies property

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
const parseCookies = (req, res, next) => {
  req.cookies = {};

  var rawCookie = req.header('Cookie');
  if (!rawCookie) {
    next();
    return;
  }
  var cooked = rawCookie.split('; ');
  for (var i = 0; i < cooked.length; i++) {
    var [key, value] = cooked[i].split('=');
    req.cookies[key] = value;
  }

  next();
};

module.exports = parseCookies;
