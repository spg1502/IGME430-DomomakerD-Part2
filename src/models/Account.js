var crypto = require('crypto');
var mongoose = require('mongoose');

var AccountModel;
var iterations = 10000;
var saltLength = 64;
var keyLength = 64;

var AccountSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        match: /^[A-Za-z0-9_\-\.]{1,16}$/
    },
	
	team: {
		type: String,
		required: false,
		trim: true,
		unique: false,
        match: /^[A-Za-z0-9_\-\.]{1,16}$/
	},
	
	salt: {
		type: Buffer,
		required: true
	},
    
    password: {
        type: String,
        required: true
    },
    
    createdData: {
        type: Date,
        default: Date.now
    }

});

AccountSchema.methods.toAPI = function() {
    //_id is built into your mongo document and is guaranteed to be unique
    return {
        username: this.username,
        _id: this._id,
		team: this.team
    };
};

AccountSchema.methods.validatePassword = function(password, callback) {
	var pass = this.password;
	
	crypto.pbkdf2(password, this.salt, iterations, keyLength, function(err, hash) {
		if(hash.toString('hex') !== pass) {
			return callback(false);
		}
		return callback(true);
	});
};

AccountSchema.statics.findByUsername = function(name, callback) {

    var search = {
        username: name
    };

    return AccountModel.findOne(search, callback);
};

AccountSchema.statics.findByTeam = function(name, callback)
{
	var search = {
		team: name
	};
	
	return AccountModel.find(search).select("username").exec(callback);
};

AccountSchema.statics.findAllTeamMembers = function(callback)
{
	return AccountModel.find({team: {$exists: true}}).select("username team").exec(callback);
};

AccountSchema.statics.generateHash = function(password, callback) {
	var salt = crypto.randomBytes(saltLength);
	
	crypto.pbkdf2(password, salt, iterations, keyLength, function(err, hash){
		return callback(salt, hash.toString('hex'));
	});
};

AccountSchema.statics.authenticate = function(username, password, callback) {
	return AccountModel.findByUsername(username, function(err, doc) {

		if(err)
		{
			return callback(err);
		}

        if(!doc) {
            return callback();
        }

        doc.validatePassword(password, function(result) {
            if(result === true) {
                return callback(null, doc);
            }
            
            return callback();
        });
        
	});
};

AccountModel = mongoose.model('Account', AccountSchema);


module.exports.AccountModel = AccountModel;
module.exports.AccountSchema = AccountSchema;