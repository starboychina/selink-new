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
                var groupids = new Array();
                for (var i = groups.length - 1; i >= 0; i--) {
                    var group = groups[i];
                    groupids.push(group.id);
                    setGroup(req,group.id);
                    group.participants.addToSet(req.params.id);
                    group.announcelist.addToSet(req.params.id);
                    group.save();
                    updateUser(req, res, next);
                };
                for (var i = req.body.stations.length - 1; i >= 0; i--) {
                    var sid = req.body.stations[i];
                    if(groupids.indexOf(sid)==-1){
                        createGroup(req,sid,function(err,group){
                            setGroup(req,group.id);
                            updateUser(req, res, next);
                        });
                    }
                };
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
    User.findById(req.params.id,"groups")
        .populate('groups',{},{"type":"station","_id":{"$ne":stasionids}})
        .exec(function(err,user){
            for (var i = user.groups.length - 1; i >= 0; i--) {
                req.user.groups.pull(user.groups[i].id);
                user.groups[i].participants.pull(user.id);
                user.groups[i].announcelist.pull(user.id);
                user.groups[i].stickylist.pull(user.id);
                user.groups[i].save();
            };
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
        "station._id":{"$in":stasionids},
        "station.type":"station"
    };

    Group.find(condition).exec(callback);
};
var createGroup = function (req,sid, callback){
    Station.findById(sid,function(err,station){
        if (err) callback(err,{});
        else if(station){
            var group = {
                "_owner":req.user.id,/////////※管理者IDに設定するか　nullにするか。。。。。。
                "participants":req.user.id,
                "name":station.name,
                "type": "station",
                "description": station.name,
                "station":station.id,
            }
            Group.create(group, function(err,group){
                callback(err,group);
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