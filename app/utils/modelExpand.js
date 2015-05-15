
var groupEx =  function(group,user){
	group = group.toObject();
    if( group.type == "station"){
        group.section = "0";//"station";
    }else if(group._owner == user.id || user.groups.indexOf(group._id) != -1){
        group.section = "1";//"mygroup";
    }else{
        group.section = "2";//"discover";
    }
    group.isSticky = group.stickylist.indexOf(user.id) == -1 ? false:true; 
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
module.exports.group = groupEx;