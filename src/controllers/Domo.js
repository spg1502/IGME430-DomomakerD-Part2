var _ = require('underscore');
var models = require('../models');

var Domo = models.Domo;
var Account = models.Account;

var makerPage = function(req, res)
{
	Domo.DomoModel.findByOwner(req.session.account._id, function(err, docs)
	{
		if(err)
		{
			console.log(err);
			return res.status(400).json({error: "An error occurred"});
		}
		if(req.session.account.team)
		{
			Account.AccountModel.findByTeam(req.session.account.team, function(err, teamDocs)
			{
				if(err)
				{
					console.log(err);
					return res.status(400).json({error: "An error occurred"});
				}
				res.render('app', {csrfToken: req.csrfToken(), domos: docs, team: req.session.account.team, teamNames: teamDocs});
			});
		
		}
		else
		{
			res.render('app', {csrfToken: req.csrfToken(), domos: docs});
		}
	});
};

var makeDomo = function(req, res)
{
	if(!req.body.name || !req.body.age)
	{
		return res.status(400).json({error: "RAWR! Both name and age are required"});
	}
	
	var domoData =
	{
		name: req.body.name,
		age: req.body.age,
		owner: req.session.account._id
	};
	
	var newDomo = new Domo.DomoModel(domoData);
	
	newDomo.save(function(err)
	{
		if(err)
		{
			console.log(err);
			return res.status(400).json({error: "An error occurred"});
		}
		
		res.json({redirect: "/maker"});
	});
};

module.exports.makerPage = makerPage;
module.exports.make = makeDomo;