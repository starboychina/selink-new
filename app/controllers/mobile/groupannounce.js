var async = require('async'),
    mongoose = require('mongoose'),
    Group = mongoose.model('Group'),
    User = mongoose.model('User');

module.exports = function(req, res, next) {
	console.log(req.user);
	if( req.user.groups.indexOf(req.params.group)>=0){
		Group.findById(req.params.group, function(err,group){
			if (err) next(err);
			else{
				if (req.params.announce == 1 ){
	        		group.announcelist.addToSet(req.user.id);
	        	}else{
	        		group.announcelist.pull(req.user.id);
	        	}
	            group.save();
	            res.json(group);
			}
		});
	}else{
		res.json(403,{});
	}
};