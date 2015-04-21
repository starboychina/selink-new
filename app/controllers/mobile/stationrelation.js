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

var findUserIds = function (req, res, next,callback){
	User.find(req.query,{"_id":true},function(err,users){
    	if (err) next(err);
        else if (users.length === 0) res.json(404, {});

    	var uids = Array();
    	for (var i = users.length - 1; i >= 0; i--) {
    		uids.push(users[i].id);
    	};
    	callback(uids);
    });
}

var findposts = function(req, res, next){
	findUserIds(req, res, next,function(uids){
		var query = Post.find();
	    // query posts belong to current user and his/her friends and groups
	    query.or([
	        {_owner: {$in: uids}}
	        ]);
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
	findUserIds(req, res, next,function(uids){
		var query = Group.find();
	    // query posts belong to current user and his/her friends and groups
	    query.or([
	        {_owner: {$in: uids}}
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