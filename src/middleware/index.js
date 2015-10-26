//This file functions as an interceptor for outgoing requests from the client
//If they try to access a page without being logged in, we want to prevent them from doing that rather than send them to an error page
//Middleware allows us to intercept the request, check various data, make decisions and respond appropriately
//A middleware function recieves a request, a response and the next function to call. In addition to access to our database, we can use this information to make informed decisions about how to respond to user requests

var requiresLogin = function(req, res, next)
{
	if(!req.session.account)
	{
		return res.redirect('/');
	}
	
	next();
};

var requiresLogout = function(req, res, next)
{
	if(req.session.account)
	{
		return res.redirect('/maker');
	}
	
	next();
};
// !req.secure works on most servers, but heroku encrypts everything internally, so for heroku apps, we instead check if the x-forwarded-proto header is 'https' (i.e. secure)
var requiresSecure = function(req, res, next)
{
	if(req.headers['x-forwarded-proto'] != 'https' || !req.secure)
	{
		return res.redirect('https://' + req.host + req.url);
	}
	next();
};

var bypassSecure = function(req, res, next)
{
	next();
};

module.exports.requiresLogin = requiresLogin;
module.exports.requiresLogout = requiresLogout;

if(process.env.NODE_ENV === 'production')
{
	module.exports.requiresSecure = requiresSecure;
}
else
{
	module.exports.requiresSecure = bypassSecure;
}