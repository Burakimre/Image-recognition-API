let passport = require('passport');
let methods = {};

methods.getLogin = function(req, res) {
  res.render('login', {
    error: req.flash('loginMessage')
  });
};

methods.getSignup = function(req, res) {
  res.render('signup', {
    error: req.flash('signupMessage')
  });
};

methods.getLogout = function(req, res) {
  req.logout();
  res.redirect('/');
};

// local
methods.postLocalSignup = passport.authenticate('local-signup', {
  successRedirect: '/profile',
  failureRedirect: '/signup',
  failureFlash: true
});

methods.postLocalLogin = passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
});

methods.getConnectLocal = function (req, res) {
  res.render('connect-local.hbs', {
    error: req.flash('loginMessage')
  });
};

methods.postConnectLocal = passport.authenticate('local-signup', {
  successRedirect: '/profile',
  failureRedirect: '/connect/local',
  failureFlash: true
});

methods.unlinkLocal = function (req, res) {
  var user = req.user;
  user.local.email = undefined;
  user.local.password = undefined;
  user.save(function (err) {
    res.redirect('/profile');
  });
};

// facebook
methods.getAuthFacebook = passport.authenticate('facebook', {
  scope: ['public_profile', 'email']
});

methods.getAuthFacebookCallback = passport.authenticate('facebook', {
  successRedirect: '/profile',
  failureRedirect: '/'
});

methods.getConnectFacebook = passport.authorize('facebook', {
  scope: ['public_profile', 'email']
});

methods.getConnectFacebookCallback = passport.authorize('facebook', {
  successRedirect: '/profile',
  failureRedirect: '/'
});

methods.unlinkFacebook = function (req, res) {
  var user = req.user;
  user.facebook.token = undefined;
  user.save(function (err) {
    res.redirect('/profile');
  });
};

// google
methods.getAuthGoogle = passport.authenticate('google', {
  scope: ['profile', 'email']
});

methods.getAuthGoogleCallback = passport.authenticate('google', {
  successRedirect: '/profile',
  failureRedirect: '/'
});

methods.getConnectGoogle = passport.authorize('google', {
  scope: ['profile', 'email']
});

methods.getConnectGoogleCallback = passport.authorize('google', {
  successRedirect: '/profile',
  failureRedirect: '/'
});

methods.unlinkGoogle = function (req, res) {
  var user = req.user;
  user.google.token = undefined;
  user.save(function (err) {
    res.redirect('/profile');
  });
};

module.exports = methods;
