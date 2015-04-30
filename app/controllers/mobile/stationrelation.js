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
	return;
};

var finduser = function(req, res, next){
	User.find(req.query,function(err,users){
    	if(err){res.json(404, {});}
    	res.json(200, users);
	});
};

var findgroups = function (req, res, next,callback){

	var condition_group = {};
	var condition_station = {};
	for (var index in req.query) {
		//console.log(index);
		if ( /station(s)?\./.test(index)){
			var key = index.replace(/station(s)?\./,"");
			condition_station[key] =  key=="_id"? req.query[index]: new RegExp('^'+req.query[index]+'$', "i");
		}else{
			condition_group[index] = index=="_id"? req.query[index]: new RegExp('^'+req.query[index]+'$', "i");
		}
	};

	var query = Group.find(condition_group)
		.select('_owner type name cover description participants posts events createDate station')
		.populate('station',{},condition_station)
        .where('logicDelete').equals(false)
        .limit(req.query.size || 20)
        .sort('-createDate')
        .exec(function(err, groups) {
            if (err) next(err);
            else if (groups.length === 0) res.json(404, {});
            else {
            	if (Object.keys(condition_station).length >0) {
	            	groups = groups.filter(function(group){
	            		return group.station;
	            	});
            	}
            	if (callback){
            		var gids = new Array();
            		for (var i = groups.length - 1; i >= 0; i--) {
            			gids = gids.concat(groups[i].posts);
            		};
            		callback(gids);
            	}else{
            		res.json(200, groups);
            	}
            }
        });
}

var findposts = function(req, res, next){
	findgroups(req, res, next,function(sids){
		var query = Post.find({"_id": {$in: sids}});
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