var aws = require('aws-sdk')
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');

const multer = require('multer');
var multerS3 = require('multer-s3')
const expressValidator = require('express-validator');
const mongo = require('mongodb');
var db = require('monk')(process.env.MONGODB_URI || 'mongodb://localhost/nodeblog');

var index = require('./routes/index');
var users = require('./routes/users');
var posts = require('./routes/posts');
var categories = require('./routes/categories');
var app = express();

//Handle Sessions
app.use(
  session({
    secret: 'nyan cat',
    saveUninitialized: true,
    resave: true
  })
);
// Passport Middleware

app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next) {
  res.locals.user = req.user || null;
  next();
});

aws.config.update({
  region: 'us-east-1'
  // credentials: new AWS.CognitoIdentityCredentials({
  //   IdentityPoolId: IdentityPoolId
  // })
});


app.locals.moment = require('moment');
app.locals.truncateText = require('html-truncate');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// Handle File uploads
var upload = multer({ dest: 'uploads/' });

//Handle Sessions
app.use(
  session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
  })
);
app.use(
  expressValidator({
    errorFormatter: function(param, msg, value) {
      var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    }
  })
);
//Flash Messages

app.use(require('connect-flash')());
app.use(function(req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.use((req, res, next) => {
  req.db = db;
  next();
});

app.use('/', index);
app.use('/users', users);
app.use('/posts', posts);
app.use('/categories', categories);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
