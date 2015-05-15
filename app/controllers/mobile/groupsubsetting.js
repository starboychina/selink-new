var async = require('async'),
    mongoose = require('mongoose'),
    Group = mongoose.model('Group'),
    User = mongoose.model('User');

module.exports = function(req, res, next) {
	if( req.user.groups.indexOf(req.params.group)>=0){
		Group.findById(req.params.group, function(err,group){
			if (err) next(err);
			else{
				setsubdoc (group,req, res, next);
			}
		});
	}else{
		res.json(403,{});
	}
};

function setsubdoc (group,req, res, next){

	if (req.params.subkey == "announce"){
		if (req.params.subvalue == 1 ){
			group.announcelist.addToSet(req.user.id);
		}else{
			group.announcelist.pull(req.user.id);
		}
	}else if (req.params.subkey == "sticky"){
		if (req.params.subvalue == 1 ){
			group.stickylist.addToSet(req.user.id);
		}else{
			group.stickylist.pull(req.user.id);
		}
	}
    group.save();

    group = group.toObject();
    if( group.type == "station"){
        group.section = "0";//"station";
    }else if(group._owner == req.user.id || req.user.groups.indexOf(group._id) != -1){
        group.section = "1";//"mygroup";
    }else{
        group.section = "2";//"discover";
    }
    group.isSticky = group.stickylist.indexOf(req.user.id) == -1 ? false:true; 
    
    res.json(group);
}