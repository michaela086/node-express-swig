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
var formidable = require('formidable');
var util = require('util');
var fs   = require('fs-extra');

var Settings = require('./models/settings');
var Auction = require('./models/auction');
var Images = require('./models/images');

var server_config = require('./server_config.js');

var initPassport = require('./passport/init');
initPassport(passport);

var mongoose = require('mongoose');
var mongooseOptions = {
  db: { native_parser: true },
  server: { poolSize: 10 },
  user: '',
  pass: ''
}
mongoose.connect('mongodb://'+server_config.serverip+'/passport', mongooseOptions);

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

eval(fs.readFileSync(__dirname + '/admin/signup.js')+'');
eval(fs.readFileSync(__dirname + '/admin/routes.js')+'');
eval(fs.readFileSync(__dirname + '/routes.js')+'');
eval(fs.readFileSync(__dirname + '/socket.js')+'');

console.log('Application Started on http://'+server_config.serverip+':'+server_config.serverport+'/');

//This will create the default settings if there are none
//Settings.remove(function (err) { if (err) return console.error(err); });
Settings.findOne(function(err, local_settings) {
    if (!local_settings) {
    	var localSettings = new Settings();

	    localSettings.website_name = 'Auction Site';
	    localSettings.website_title = 'Auction Title';
	    localSettings.minimal_bid_increase = '5.00';
	    localSettings.allow_high_bidder_increase_own_bid = '1';
	    localSettings.currency_symbol = '$';
	    localSettings.extend_auction_enable = '1';
        localSettings.extend_auction_add = '60';
        localSettings.extend_auction_within = '60';

	    localSettings.save(function(err) {
	        if (err){
	            console.log('Error while saving settings: '+err);  
	            throw err;  
	        }
	        console.log('\nLocal settings saved succesfully\n');    
	    });
    }
});


server.listen(server_config.serverport);
