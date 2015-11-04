var models = require('../models');

var Domo = models.Domo;
var Account = models.Account;

var loginPage = function(req, res)
{
	res.render('login', {csrfToken: req.csrfToken()});
};

var signupPage = function(req, res)
{
	res.render('signup', {csrfToken: req.csrfToken()});
};

var teamStatsPage = function(req, res)
{
	Account.AccountModel.findAllTeamMembers(function(err, teamDocs)
	{
		if(err)
		{
			return res.status(401).json({error: "RAWR! Attempt to find all users who are a part of a team has failed!"});
		}
		res.render('teamstats', {csrfToken: req.csrfToken(), teamNames: teamDocs});
	});
};

var logout = function(req, res)
{
	req.session.destroy();
	res.redirect('/');
};

var login = function(req, res)
{
	if(!req.body.username || !req.body.pass)
	{
		return res.status(400).json({error: "RAWR! All fields are required"});
	}
	
	Account.AccountModel.authenticate(req.body.username, req.body.pass, function(err, account)
	{
		if(err || !account)
		{
			return res.status(401).json({error: "Wrong username or password"});
		}
		req.session.account = account.toAPI();
		res.json({redirect: '/maker'});
	});
};

var signup = function(req, res)
{
	if(!req.body.username || !req.body.username || !req.body.pass2)
	{
		return res.status(400).json({error: "RAWR! All fields are required"});
	}
	
	if(req.body.pass !== req.body.pass2)
	{
		return res.status(400).json({error: "RAWR! Passwords do not match"});
	}
	
	Account.AccountModel.generateHash(req.body.pass, function(salt,hash)
	{
		var accountData =
		{
			username: req.body.username,
			salt: salt,
			password: hash
		};
		
		var newAccount = new Account.AccountModel(accountData);
		
		newAccount.save(function(err)
		{
			if(err)
			{
				console.log(err);
				return res.status(400).json({error:"An error occured"});
			}
			req.session.account = newAccount.toAPI();
			res.json({redirect: '/maker'});
		});
	});
};

var joinTeam = function(req, res)
{
	if(!req.body.teamname)
	{
		return res.status(400).json({error: "RAWR! Please input a team name"});
	}
	Account.AccountModel.findById(req.session.account._id, function(err, userAccount)
	{
		req.session.account.team = req.body.teamname;
		userAccount.team = req.body.teamname;
		userAccount.save(function(err)
		{
			if(err)
			{
				console.log(err);
				return res.status(400).json({error:"An error occurred"});
			}
			res.json({redirect: "/maker", team: req.body.teamname});
		});
	});
};

module.exports.loginPage = loginPage;
module.exports.login = login;
module.exports.logout = logout;
module.exports.signupPage = signupPage;
module.exports.signup = signup;
module.exports.joinTeam = joinTeam;
module.exports.teamStatsPage = teamStatsPage;