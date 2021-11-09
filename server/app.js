const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const Auth = require('./middleware/auth');
const Cookies = require('./middleware/cookieParser');
const Verify = require('./middleware/verifySession');
const models = require('./models');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(Cookies);
app.use(Auth.createSession);
app.use(/\/(create|links)?$/, Verify);


app.get('/', (req, res) => {
  res.render('index');
});

app.get('/create', (req, res) => {
  res.render('index');
});

app.get('/links', (req, res) => {
  models.Links.getAll()
    .then(links => res.status(200).send(links))
    .catch(err => res.status(500).send(err));
});

app.post('/links', (req, res) => {
  var url = req.body.url;
  if (!models.Links.isValidUrl(url)) {
    // send back a 404 if link is not valid
    res.sendStatus(404);
    return;
  }

  models.Links.get({ url })
    .then(link => {
      return link || models.Links.getUrlTitle(url);
    })
    .then(title => typeof title !== 'string' ? title : models.Links.create({
      url: url,
      title: title,
      baseUrl: req.headers.origin
    }))
    .then(results => {
      return models.Links.get({ id: results.insertId || results.id });
    })
    .then(link => res.status(200).send(link))
    .catch(err => res.status(500).send(err));
});

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.post('/signup', (req, res) => {
  models.Users.create(req.body)
    .then(results => models.Sessions.associate(req.session.hash, results.insertId))
    .then(() => res.redirect('/'))
    .catch(err => res.redirect('/signup'));
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/login', (req, res) => {
  models.Users.login(req.body)
    .then(userId => {
      if (userId) {
        models.Sessions
          .associate(req.session.hash, userId);
        res.redirect('/');
      } else {
        res.redirect('/login');
      }
    })
    .catch(err => res.status(500).send(error));
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/logout', (req, res) => {
  if (!req.cookies.shortlyid) {
    res.redirect('/');
    return;
  }
  models.Sessions.destroy(req.cookies.shortlyid)
    .then(() => {
      delete req.cookies.shortlyid;
      return Auth.createSession(req, res, () => res.redirect('/'));
    })
    .catch(err => res.status(500).send(error));

});

/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res) => {
  return models.Links.get({ code: req.params.code })
    .then(link => {
      if (!link) {
        res.redirect('/');
        throw false;
      }
      return models.Clicks.create({ linkId: link.id }).then(() => link);
    })
    .then(link => {
      return models.Links
        .update({code: req.params.code}, { visits: link.visits + 1 })
        .then(() => link);
    })
    .then((result) => {
      res.redirect(result.url);
    })
    .catch(err => err && res.status(500).send(err));
});

module.exports = app;
