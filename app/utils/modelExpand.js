
var mongoose = require('mongoose'),
    Post = mongoose.model('Post');


var groupEx =  function(group,user){
    var isSticky = group.stickylist.indexOf(user.id) == -1 ? false:true;
	group = group.toObject();
    if( group.type == "station"){
        group.section = "0";//"station";
    }else if(group._owner == user.id || user.groups.indexOf(group._id) != -1){
        group.section = "1";//"mygroup";
    }else{
        group.section = "2";//"discover";
    }
    group.isSticky = isSticky; 
    return group;
}
module.exports.groups = function(groups,user){
	if (groups.length == undefined){
		groups = [groups];
	}
	return groups.map(function (group) {
        return groupEx(group,user)
    });
};

module.exports.groupsWithCallback = function(groups,user){
    Post.find({},function(err,posts){
        
    });
};
module.exports.group = groupEx;