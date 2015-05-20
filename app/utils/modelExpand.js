
var mongoose = require('mongoose'),
    Post = mongoose.model('Post');


var groupEx =  function(group,user,isWithLastPost){
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
    if(isWithLastPost){
        var post = group.posts[group.posts.length-1]
        group.lastPostDate = post.createDate; 
        group.lastPost = post; 
        delete group.posts;
    }
    return group;
}
module.exports.groups = function(groups,user,isWithLastPost){
	if (groups.length == undefined){
		groups = [groups];
	}
	return groups.map(function (group) {
        return groupEx(group,user,isWithLastPost)
    });
};
module.exports.group = groupEx;