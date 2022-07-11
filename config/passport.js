// Load mongoose
let mongoose = require('mongoose');

// Load local passport
let LocalStrategy = require('passport-local').Strategy;
let FacebookStrategy = require('passport-facebook').Strategy;
let GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// Load user model
let User = mongoose.model('User');

// Load auth variables
let configAuth = require('./auth');

// Expose to app
module.exports = function (passport) {

  // ==========================
  // Passport session setup ===
  // ==========================

  // Serialize user
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  })

  // Deserialize user
  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  // ==========================
  // LOCAL SIGNUP =============
  // ==========================
  passport.use('local-signup', new LocalStrategy({
      // by default, local strategy uses username and password, we will override with email
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function (req, email, password, done) {

      // asynchronous
      process.nextTick(function () {

        //  Whether we're signing up or connecting an account, we'll need
        //  to know if the email address is in use.
        User.findOne({
          'local.email': email
        }, function (err, existingUser) {

          // if there are any errors, return the error
          if (err)
            return done(err);

          if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return done(null, false, req.flash('signupMessage', 'You have entered an invalid email.'));
          }

          // check to see if there's already a user with that email
          if (existingUser)
            return done(null, false, req.flash('signupMessage', 'That email is already taken.'));

          //  If we're logged in, we're connecting a new local account.
          if (req.user) {
            var user = req.user;
            user.local.email = email;
            user.local.password = user.generateHash(password);
            user.save(function (err) {
              if (err)
                throw err;
              return done(null, user);
            });
          }
          //  We're not logged in, so we're creating a brand new user.
          else {
            // create the user
            var newUser = new User();

            newUser.local.email = email;
            newUser.local.password = newUser.generateHash(password);
            newUser.role = 'user';

            newUser.save(function (err) {
              if (err)
                throw err;

              return done(null, newUser);
            });
          }

        });
      });

    }));

  // ==========================
  // LOCAL LOGIN ==============
  // ==========================
  passport.use('local-login', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    function (req, email, password, done) { // callback with email and password from our form

      // find a user whose email is the same as the forms email
      User.findOne({
        'local.email': email
      }, function (err, user) {
        // if there are any errors, return the error before anything else
        if (err)
          return done(err);

        // if no user is found, return the message
        if (!user || !user.validPassword(password))
          return done(null, false, req.flash('loginMessage', 'Wrong email or password.'));

        // all is well, return successful user
        return done(null, user);
      });
    }));

  // ==========================
  // FACEBOOK =================
  // ==========================
  passport.use(new FacebookStrategy({

      clientID: configAuth.facebookAuth.clientID,
      clientSecret: configAuth.facebookAuth.clientSecret,
      callbackURL: configAuth.facebookAuth.callbackURL,
      profileFields: configAuth.facebookAuth.profileFields,
      passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function (req, token, refreshToken, profile, done) {

      // asynchronous
      process.nextTick(function () {

        // check if the user is already logged in
        if (!req.user) {

          User.findOne({
            'facebook.id': profile.id
          }, function (err, user) {
            if (err)
              return done(err);

            if (user) {

              // if there is a user id already but no token (user was linked at one point and then removed)
              if (!user.facebook.token) {
                user.facebook.token = token;
                user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                user.facebook.email = profile.emails[0].value;

                user.save(function (err) {
                  if (err)
                    throw err;
                  return done(null, user);
                });
              }

              return done(null, user); // user found, return that user
            } else {
              // if there is no user, create them
              var newUser = new User();

              newUser.facebook.id = profile.id;
              newUser.facebook.token = token;
              newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
              newUser.facebook.email = profile.emails[0].value;
              newUser.role = 'user';

              newUser.save(function (err) {
                if (err)
                  throw err;
                return done(null, newUser);
              });
            }
          });

        } else {
          // user already exists and is logged in, we have to link accounts
          var user = req.user; // pull the user out of the session

          user.facebook.id = profile.id;
          user.facebook.token = token;
          user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
          user.facebook.email = profile.emails[0].value;

          user.save(function (err) {
            if (err)
              throw err;
            return done(null, user);
          });

        }
      });

    }));

  // ==========================
  // GOOGLE ===================
  // ==========================
  passport.use(new GoogleStrategy({

      clientID: configAuth.googleAuth.clientID,
      clientSecret: configAuth.googleAuth.clientSecret,
      callbackURL: configAuth.googleAuth.callbackURL,
      passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function (req, token, refreshToken, profile, done) {

      // asynchronous
      process.nextTick(function () {

        // check if the user is already logged in
        if (!req.user) {

          User.findOne({
            'google.id': profile.id
          }, function (err, user) {
            if (err)
              return done(err);

            if (user) {

              // if there is a user id already but no token (user was linked at one point and then removed)
              if (!user.google.token) {
                user.google.token = token;
                user.google.name = profile.displayName;
                user.google.email = profile.emails[0].value; // pull the first email

                user.save(function (err) {
                  if (err)
                    throw err;
                  return done(null, user);
                });
              }

              return done(null, user);
            } else {
              var newUser = new User();

              newUser.google.id = profile.id;
              newUser.google.token = token;
              newUser.google.name = profile.displayName;
              newUser.google.email = profile.emails[0].value; // pull the first email
              newUser.role = 'user';

              newUser.save(function (err) {
                if (err)
                  throw err;
                return done(null, newUser);
              });
            }
          });

        } else {
          // user already exists and is logged in, we have to link accounts
          var user = req.user;

          user.google.id = profile.id;
          user.google.token = token;
          user.google.name = profile.displayName;
          user.google.email = profile.emails[0].value;

          user.save(function (err) {
            if (err)
              throw err;
            return done(null, user);
          });
        }
      });
    }));
}