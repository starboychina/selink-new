// Edit Profile
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Group = mongoose.model('Group'),
    Station = mongoose.model('Station');

module.exports = function(req, res, next) {
    //req.body = req.query; //テスト
    delete req.body._id;
    if(req.body.bio){
        req.body.bioText =  (req.body.bio)? req.body.bio.replace(/<[^>]*>/g, ''):'';
    }
    if (req.body.stations){
        var changeGroup = function(err, groups){
            if (err) next(err);
            else {
                var stationids = req.body.stations.slice(0);//clone
                for (var i = groups.length - 1; i >= 0; i--) {
                    var group = groups[i];
                    var group_station = group.station.toString();
                    var index = stationids.indexOf(group_station);
                    stationids.splice(index,1);

                    setGroup(req,group.id);
                    group.participants.addToSet(req.params.id);
                    group.announcelist.addToSet(req.params.id);
                    group.save();
                };
                if(stationids.length > 0){
                    createGroups(req,stationids,function(err,groups){
                        for (var i = groups.length - 1; i >= 0; i--) {
                            var group = groups[i];
                            setGroup(req,group.id);
                        };
                        updateUser(req, res, next);
                    });
                }else{
                    updateUser(req, res, next);
                }
            }
        }
        deleteGroup(req,function(stasionids){
            findGroupByStationIds(stasionids,changeGroup);
        });
    }else{
        updateUser(req, res, next);
    }
};
var deleteGroup = function (req,callback){
    var stasionids = req.body.stations;
    var condition_group = {"type":"station","station":{"$nin":stasionids}};
    User.findById(req.params.id,"groups")
        .populate('groups',{},condition_group)
        .exec(function(err,user){
            if(user){
                for (var i = user.groups.length - 1; i >= 0; i--) {
                    req.user.groups.pull(user.groups[i].id);
                    user.groups[i].participants.pull(user.id);
                    user.groups[i].announcelist.pull(user.id);
                    user.groups[i].stickylist.pull(user.id);
                    user.groups[i].save();
                };
            }
            callback(stasionids);
        })
}
var setGroup = function(req,groupid){
    if(!groupid){return ;}
    if(req.user.groups.indexOf(groupid) == -1){
        req.user.groups.push(groupid)
        ////////////////
        if(req.body.groups){
            for (var i = req.body.groups.length - 1; i >= 0; i--) {
                var g = req.body.groups[i];
                if(req.user.groups.indexOf(g) == -1){
                    req.user.groups.push(g);
                }
            };
        }
        /////////////////
        req.body.groups = req.user.groups;
    }
};
var findGroupByStationIds = function(stasionids,callback){
    var condition = {
        "station":{"$in":stasionids},
        "type":"station"
    };
    Group.find(condition).exec(callback);
};
var createGroups = function (req,sids, callback){
    Station.find({"_id":{"$in":sids}},function(err,stations){
        if (err) callback(err,{});
        else if (stations.length < 1 ) callback(err,{});
        else{
            var groups = new Array();
            for (var i = stations.length - 1; i >= 0; i--) {
                var station = stations[i];
                var group = {
                    "_owner":req.user.id,/////////※管理者IDに設定するか　nullにするか。。。。。。
                    "participants":req.user.id,
                    "name":station.name,
                    "type": "station",
                    "description": station.name,
                    "station":station.id,
                };
                groups.push(group);
            };
            Group.create(groups, function (err) {
                if (err)  callback(err,{});
                else {
                    var gs = new Array();
                    for (var i=1; i<arguments.length; ++i) {
                        gs.push(arguments[i]);
                    }
                    callback(err,gs);
                }
            });
        }
    });
}
var updateUser = function(req, res, next){
    // update user info
    User.findByIdAndUpdate(req.params.id, req.body, function(err, updatedUser) {

        if (err) next(err);
        else {
            // index user in solr
            solr.add(updatedUser.toSolr(), function(err, solrResult) {
                if (err) next(err);
                else {
                    console.log(solrResult);
                    solr.commit(function(err,res){
                       if(err) console.log(err);
                       if(res) console.log(res);
                    });
                }
            });

            res.send(updatedUser);
        }
    });
}