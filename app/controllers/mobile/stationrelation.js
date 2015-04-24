// Create new sub document
var mongoose = require('mongoose'),
    Line = mongoose.model('Line'),
    Post = mongoose.model('Post'),
    Group = mongoose.model('Group'),
    User = mongoose.model('User');

module.exports = function(req, res, next) {
	var sub = req.params.sub;
	switch(sub){
		case"users":
			finduser(req, res, next);
		break;
		case"posts":
			findposts(req, res, next);
		break;
		case"groups":
			findgroups(req, res, next);
		break;
		default:
		res.json(404, {});

	}

	console.log(sub);
	return;
};

var finduser = function(req, res, next){
	User.find(req.query,function(err,users){
    	if(err){res.json(404, {});}
    	res.json(200, users);
	});
};

var findStations = function (req, res, next,callback){
	var oneStation = {};
	for (var index in req.query) {
		if ( /stations./.test(index)){
			oneStation = {
				'name':true,
				'pref':true,
				'stations.$': true};
			break;
		}
	};
    //station
    Line.find(req.query,oneStation,function(err,lines){
        if (err) next(err);
        else if (lines.length === 0) res.json(404, {});
		var sids = Array();
    	for (var i = lines.length - 1; i >= 0; i--) {
    		sids.push(lines[i].stations[0].id);
    	};
    	callback(sids);
    });
}

var findposts = function(req, res, next){
	findStations(req, res, next,function(sids){
		var query = Post.find({"station": {$in: sids}});
	    // query posts belong to current user and his/her friends and groups

		query.select('-removedComments -logicDelete')
		        .populate('_owner', 'type firstName lastName title cover photo')
		        .populate('group', 'type firstName lastName title cover photo')
		        .populate('comments._owner', 'name cover description')
		        .where('logicDelete').equals(false)
		        .limit(req.query.size || 20)
		        .sort('-createDate')
		        .exec(function(err, posts) {
		            if (err) next(err);
		            else if (posts.length === 0) res.json(404, {});
		            else {
    					res.json(200, posts);
		            }
		        });
	});
};

var findgroups = function(req, res, next){
	findStations(req, res, next,function(sids){
		var query = Group.find();
	    // query posts belong to current user and his/her friends and groups
	    query.or([
	        {"station": {$in: sids}}
	        ]);
	    
		query.select('_owner type name cover description participants posts events createDate')
        .where('logicDelete').equals(false)
        .limit(req.query.size || 20)
        .sort('-createDate')
        .exec(function(err, groups) {
            if (err) next(err);
            else if (groups.length === 0) res.json(404, {});
            else res.json(groups);
        });
	});
};