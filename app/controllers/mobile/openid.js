// Create new sub document
var User = require('mongoose').model('User'),
    Create = require('../user/createSubDocument'),
    Update = require('../user/updateSubDocument');

module.exports = function(req, res, next) {
    //req.body = req.query; //テスト
    req.params.id = req.session.userId;
    req.params.sub = "openids";
    if (req.body.openid){
        User.findById(req.params.id, function(err, user) {
            if (err) next(err);
            else {
                if (req.body.type == "wx"){req.body.type = "wechat";}
                var param = {
                    "openids.openid":req.body.openid,
                    "openids.type":req.body.type,
                    "_id":{"$ne":req.params.id},
                };
                User.find(param,{"_id":true},function(err,users){
                    if (err) next(err);
                    else if (users.length > 0) res.json(401, {});
                    else{
                        console.log(users);
                        user.openids.forEach(function(openid) {
                            //if(openid.openid == req.body.openid && openid.type == req.body.type){
                            if(openid.type == req.body.type){
                                req.params.subid = openid.id;
                            }
                        });
                        if(req.params.subid){
                            Update(req, res, next);
                        }else{
                            Create(req, res, next);
                        }
                    }
                });
            }
        });
    }else{
        res.json(400, {});
    }
};