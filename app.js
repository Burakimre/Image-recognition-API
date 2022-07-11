let createError = require('http-errors');
let express = require('express');
let path = require('path');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let hbs = require('express-handlebars');
let session = require('express-session');
let passport = require('passport');
let flash = require('connect-flash');
let configDB = require('./config/database.js');
let imgur = require('imgur');
let swaggerUI = require('swagger-ui-express');
let swaggerDocument = require('./api/swagger/openapi.json');

// require environment variables
require('dotenv').config();

// Set imgur client id
imgur.setClientId(process.env.IMGUR_CLIENT_ID);

// data access layer
let mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);

// require mongoDB models
require('./models/user.js');
require('./models/target.js');
require('./models/submission.js');

let app = express();

// view engine setup
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
require('./helpers/handlebars');

// initialize bootstrap
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/css', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/css'));
app.use('/webfonts', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/webfonts'));

// pass passport for configuration
require('./config/passport')(passport);

// application setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch', cookie: { secure:false, httpOnly: false } })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// create routes
let indexRouter = require('./routes/index');
let authenticateRouter = require('./routes/authenticate');
let userRouter = require('./routes/user');
let targetsRouter = require('./routes/targets');
let apiTargetsRouter = require('./routes/api-targets');
let apiSubmissionsRouter = require('./routes/api-submissions');

// initialize routes
app.use('/', indexRouter());
app.use('/', authenticateRouter());
app.use('/api/targets', apiTargetsRouter());
app.use('/api/submissions', apiSubmissionsRouter());
app.use('/targets', targetsRouter());
app.use('/', userRouter());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
