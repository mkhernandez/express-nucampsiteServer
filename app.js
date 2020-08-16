const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');

const url = 'mongodb://localhost:27017/nucampsite';
const connect = mongoose.connect(url, {useCreateIndex: true, useFindAndModify: false, useNewUrlParser: true, useUnifiedTopology: true});

connect.then(() => console.log('Connected to the server'), err => console.log(err));

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('12345-67890-09876-54321'));

//Using authentication before serving our static files. We are creating our own function
//to handle authentication
function auth(req, res, next) {
  if(!req.signedCookies.user) { //If cookie not properly signed then it will return a value of false. Therefore, user must be authenticated.
    const authHeader = req.headers.authorization;//Grab the auth header out of the request header
    if(!authHeader) { //if no authentication information then user access is denied. Create an error message and return that message
      const err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');////This lets the client know that the server is requesting authentication
      err.status = 401;//Standard error code for no credentials provided
      return next(err);//Handle error message by sending it back to express to handle and send a new request for credentials
    }
  
    //when an authorization header is provided the string is decoded and parsed into username:password format
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const user = auth[0];//contains the username
    const pass = auth[1];//contains the password
    
    //Basic check for correct username and password
    if(user === 'admin' && pass === 'password') {
      //Setup a new cookie with the user name as admin and set signed to true thus user is authorized. We let express know that 
      //we will use the secret key in cookie parser to create a signed key
      res.cookie('user', 'admin', {signed: true});
      return next(); //user is authorized
    }else {
      const err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }
  }else {
    //If there is a signed cookie value in the incoming request, check if it is admin
    //If so then pass the client on to the next middleware function
    if(req.signedCookies.user === 'admin') {
      return next();
    }else {
      //Otherwise send an error message with no challenge to authenticate
      const err = new Error('You are not authenticated!');
      err.status = 401;
      return next(err);
    }
  }
}

app.use(auth);//incorportate our function to authenticate

//Serve up our static files. Authentication needs to occur before we serve up our static files
app.use(express.static(path.join(__dirname, 'public')));

//Define our endpoints to navigate to for our app. 
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);

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
