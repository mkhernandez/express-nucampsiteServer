const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const config = require('./config');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');
const uploadRouter = require('./routes/uploadRouter');

const url = config.mongoUrl;
const connect = mongoose.connect(url, {useCreateIndex: true, useFindAndModify: false, useNewUrlParser: true, useUnifiedTopology: true});

connect.then(() => console.log('Connected to the server'), err => console.log(err));

const app = express();

//Secure traffic only
app.all('*', (req, res, next) => {
    if(req.secure) {
      return next();
    }else {
      console.log(`Redirecting to: https://${req.hostname}:${app.get('secPort')}${req.url}`);
      res.redirect(301, `https://${req.hostname}:${app.get('secPort')}${req.url}`);
    }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser('12345-67890-09876-54321'));



//These are only needed if we are using session based authentication
app.use(passport.initialize());


//We want users to create a login if they haven't done so with the users route and give logged out users  
//and unauthenticated users access to the index page. This is why we put these endpoints here before authentication.  
app.use('/', indexRouter);
app.use('/users', usersRouter);



//Serve up our static files. Authentication needs to occur before we serve up our static files
app.use(express.static(path.join(__dirname, 'public')));

//Define our endpoints to navigate to for our app. 

app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);
app.use('/imageUpload', uploadRouter);

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
