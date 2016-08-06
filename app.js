var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');

var expressSession = require('express-session');

var app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);

var models = require('./models');

var routes = require('./routes/index');
var polls = require('./routes/polls');
var users = require('./routes/users');

var globalFunctions = require('./globalFunctions.js');

//passport's user authentication strategy
passport.use(new Strategy(
  function(username, password, cb) {
    models.User.findOne({
      where: {
        name: username
      },
      include: [
        {model: models.LoginInfo, required: true}
      ]
    }).then(function(user) {
      if (!user) { return cb(null, false); }
      if (!bcrypt.compareSync(password, user.LoginInfo.passwordHash)) { return cb(null, false); }
      return cb(null, user);
    });
  }));

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  models.User.findById(id).then(function(user) {
    cb(null, user);
  });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSession({secret:'asdf', resave:false, saveUninitialized:false}));

app.use(passport.initialize());
app.use(passport.session());

//supply logged in user object to every jade template
app.use(function(req,res,next){
  res.locals.currentUser = restrict(req.user, ['id', 'name']);
  next();
});

app.use('/', routes);
app.use('/polls', polls)
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
