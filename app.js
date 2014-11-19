var app = require('express')();
var swig = require('swig');
var people;
var fs = require('fs');
var path = require('path');
var express = require('express');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var flash = require('connect-flash');
var LocalStrategy = require('passport-local').Strategy;
var expressSession = require('express-session');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var serverport = 3000;

var initPassport = require('./passport/init');
initPassport(passport);

var dbConfig = require('./db.js');
var mongoose = require('mongoose');
mongoose.connect(dbConfig.url);

swig.setDefaults({ cache: false });
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.set('view cache', false);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressSession({
    secret: "32OIF32OIH32OIFH23IOFH2O3IHFO23I",
    saveUninitialized: true, // (default: true)
    resave: true, // (default: true)
  }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));


eval(fs.readFileSync(__dirname + '/routes.js')+'');
eval(fs.readFileSync(__dirname + '/socket.js')+'');

console.log('Application Started on http://localhost:'+serverport+'/');

server.listen(serverport);
