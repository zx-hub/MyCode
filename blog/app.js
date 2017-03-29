﻿
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');
var flash = require('connect-flash');

var app = express();
var fs = require('fs');
var accessLog = fs.createWriteStream('access.log', {flags: 'a'});
var errorLog = fs.createWriteStream('error.log', {flags: 'a'});
var passport = require('passport'), GithubStrategy = require('passport-github').Strategy;

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.logger({
		stream : accessLog
	}));
app.use(express.bodyParser({
		keepExtensions : true,
		uploadDir : './public/images'
	}));
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
		secret : settings.cookieSecret,
		key : settings.db, //cookie name
		cookie : {
			maxAge : 1000 * 60 * 60 * 24 * 30
		}, //30 days
		store : new MongoStore({
			db : settings.db
		})
	}));

app.use(express.session({
		secret : 'your secret here'
	}));
app.use(passport.initialize()); //初始化 Passport
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (err, req, res, next) {
  var meta = '[' + new Date() + '] ' + req.url + '\n';
  errorLog.write(meta + err.stack + '\n');
  next();
});
passport.use(new GithubStrategy({
		clientID : "c766a89b9e94a753bba3",
		clientSecret : "19aa49c2bcf961af45ecad7b2f6203d3e5623c7a",
		callbackURL : "http://localhost:3000/login/github/callback"
	}, function (accessToken, refreshToken, profile, done) {
		done(null, profile);
	}));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

routes(app);

http.createServer(app).listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
});