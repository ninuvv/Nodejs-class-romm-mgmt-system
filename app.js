var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

var moment = require('moment');
// var youtube=require('youtube-video-js')

// const cors = require('cors');
const _ = require('lodash');

var fileupload = require('express-fileupload');

var db = require('./config/connection')
var MongoDBStore = require('connect-mongodb-session')(session);

var paytmRouter=require('./routes/callback');
var indexRouter = require('./routes/index');
var studentRouter = require('./routes/student');
var tutorRouter = require('./routes/tutor');

var exphbs = require('express-handlebars');
const { dirname } = require('path');
const { MongoClient } = require('mongodb');
var bodyParser = require('body-parser')


var app = express();
// call socket.io to the app
//app.io = require('socket.io')();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');



//set templete engine
app.engine('hbs', exphbs({
  defaultLayout: 'layout', layoutsDir: __dirname + '/views/layout/',
  partialsDir: __dirname + '/views/Partial/',
  extname: '.hbs'
}));
app.set('view engine', 'hbs');


//create 
var hbs = exphbs.create({});

// register new function
hbs.handlebars.registerHelper('checkCond', function (str, options) {
  if (str == 'application/pdf') {
    return options.fn(this);
  }
  if (str == 'video/mp4') {
    return options.fn(this);
  }
})

hbs.handlebars.registerHelper("setChecked", function (value, currentValue) {
  if (value == currentValue) {
    return "checked";
  } else {
    return "";
  }
}),

  hbs.handlebars.registerHelper("Check", function (attendate, passingdate) {
    console.log("attedndate" + attendate)
    console.log("curreentdate" + passingdate)

    if (attendate == passingdate) {
      return "P";
    } else {
      return "A";
    }
  }),

  hbs.handlebars.registerHelper("findex", function (index) {
    return index + 1;
  }),

  hbs.handlebars.registerHelper("toUpperCase", function (str) {
    return str.toUpperCase();
  }),

  hbs.handlebars.registerHelper("datecheck", function (watchedate, datetimepicker) {
    if (watchedate == datetimepicker) {
      return "P";
    } else {
      return "A";
    }
  }),


  hbs.handlebars.registerHelper('formatTime', function (date, format) {
    var mmnt = moment(date);
    return mmnt.format(format);
  });



//session (install npm i express-session)
// app.use(session({secret:"key",cookie:{maxAge:600000}}))





//npm i --save lodashdsh
// app.use(cors());


//file upload(npm i express fileupload)
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileupload());


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use(express.static('public/images'));
// app.use(express.static('public/annoucements')); 

//db connection
db.Connection((err) => {
  if (err) console.log("connection error" + err);
  else console.log("DB connected to localhost:27017");
})


var store = new MongoDBStore({
  uri: "mongodb://localhost:27017",
  databaseName: 'CRMS',
  collection: 'mySessions'
});

// Catch errors
store.on('error', function (error) {
  console.log(error);
});

app.use(session({
  secret: 'This is a secret',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  },
  store: store,
  resave: true,
  saveUninitialized: true
}));



app.use('/', indexRouter);
app.use('/callback', paytmRouter);
app.use('/student', studentRouter);
app.use('/tutor', tutorRouter);

// //start listen with socket.io
// app.io.on('connection', function (socket) {
//   console.log('a user connected');


//   socket.on("disconnect", function () {
//     console.log('a user disconnected');
//   })

//   socket.on("sendNotification", function (details) {
//     //console.log(details)
//     socket.broadcast.emit("sendNotification", details);
//   })

  // receive from client (index.ejs) with socket.on
  // socket.on('new message', function (msg) {
  //   console.log('new message: ' + msg);
  //   app.io.emit('chat message', msg);
  // });
// });



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
