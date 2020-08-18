const createError = require('http-errors');
const express = require('express');
const path = require('path');
// const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const authenticate = require('./authenticate');

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
//app.use(cookieParser('12345-67890-09876-54321'));

//create our session object
app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false, //When a new session is created but then no updates are made to it then at the end of the request it won't get saved because it will be an empty session
  resave: false,  //Once a session has been created and saved it will continue to be resave whenver a request has been made for that session even if there are no updates
  store: new FileStore()  //Create a new file store object so we can save our session to the server hard disk
}));

//These are only needed if we are using session based authentication
app.use(passport.initialize());
app.use(passport.session());

//We want users to create a login if they haven't done so with the users route and give logged out users  
//and unauthenticated users access to the index page. This is why we put these endpoints here before authentication.  
app.use('/', indexRouter);
app.use('/users', usersRouter);

//Using authentication before serving our static files. We are creating our own function
//to handle authentication
function auth(req, res, next) {
  console.log(req.user);  //req sends a property called session so we want to see this information. This is more for development and learning purposes and not really necessary.

  if(!req.user) { //If cookie not properly signed then it will return a value of false. Therefore, user must be authenticated.
      const err = new Error('You are not authenticated!');
      err.status = 401;//Standard error code for no credentials provided
      return next(err);//Handle error message by sending it back to express to handle and send a new request for credentials
  }else {
      return next();
  }
}


app.use(auth);//incorportate our function to authenticate

//Serve up our static files. Authentication needs to occur before we serve up our static files
app.use(express.static(path.join(__dirname, 'public')));

//Define our endpoints to navigate to for our app. 

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
