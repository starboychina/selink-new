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
    if (req.body.nearestSt){
        var changeGroup = function(err, group){
            if (err) next(err);
            else {
                if(group && group.id){
                    setGroup(req,group.id);
                    group.participants.addToSet(req.params.id);
                    group.announcelist.addToSet(req.params.id);
                    group.save();
                    updateUser(req, res, next);
                }else{
                    createGroup(req,function(err,group){
                        setGroup(req,group.id);
                        updateUser(req, res, next);
                    });
                    return;
                }
            }
        }
        deleteGroup(req,function(sname){
            findGroupByStationName(sname,changeGroup);
        });
    }else{
        updateUser(req, res, next);
    }
};
var deleteGroup = function (req,callback){
    var sname = req.body.nearestSt;
    User.findById(req.params.id,"groups")
        .populate('groups',{},{"type":"station","name":{"$ne":sname}})
        .exec(function(err,user){
            for (var i = user.groups.length - 1; i >= 0; i--) {
                req.user.groups.pull(user.groups[i].id);
                user.groups[i].participants.pull(user.id);
                user.groups[i].announcelist.pull(user.id);
                user.groups[i].save();
            };
            callback(sname);
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
var findGroupByStationName = function(name,callback){
    var condition_station = {
        "name":name
    };
    var condition_group = {
        "name":name,
        "type":"station"
    };

    Group.findOne(condition_group)
        .populate('station',{},condition_station)
        .exec(callback);
};
var createGroup = function (req, callback){
    var condition_station = {
        "name":req.body.nearestSt
    };
    Station.findOne(condition_station,function(err,station){
        if (err) callback(err,{});
        else if(station){
            var group = {
                "_owner":req.user.id,/////////※管理者IDに設定するか　nullにするか。。。。。。
                "participants":req.user.id,
                "name":req.body.nearestSt,
                "type": "station",
                "description": req.body.nearestSt,
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