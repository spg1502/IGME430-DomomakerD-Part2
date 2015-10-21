//import libraries
var path = require('path');
var express = require('express');
var compression = require('compression');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');

var dbURL = process.env.MONGOLAB_URI || "mongodb://localhost/DomoMaker";

var db = mongoose.connect(dbURL, function(err)
{
	if(err)
	{
		console.log("Could not connect to database");
		throw err;
	}
});

//pull in our routes
var router = require('./router.js');
var port = process.env.PORT || process.env.NODE_PORT || 3050;

var app = express();
app.use('/assets', express.static(path.resolve(__dirname+'../../client/')));
app.use(compression());
app.use(bodyParser.urlencoded(
{
	extended: true
}));
app.use(session(
{
	key: "sessionid",
	secret: "Domo Arigato",
	resave: true,
	saveUninitialized: true
}));
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(favicon(__dirname + '/../client/img/favicon.png'));
app.use(cookieParser());

router(app);

app.listen(port, function(err)
{
	if(err)
	{
		throw err;
	}
	console.log('Listening on port ' + port);
});