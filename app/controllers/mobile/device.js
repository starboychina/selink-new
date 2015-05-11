// Create new sub document
var User = require('mongoose').model('User'),
    Create = require('../user/createSubDocument'),
    Update = require('../user/updateSubDocument'),
    Remove = require('../user/removeSubDocument');

module.exports = function(req, res, next) {
    //req.body = req.query; //テスト
    req.params.id = req.session.userId;
    req.params.sub = "devices";
    if (req.body.token){
        User.find({"devices.token":req.body.token},function(err, users){
            users.forEach(function(user) {
                if (user.id == req.params.id) {
                    user.devices.forEach(function(device) {
                        if(device.token == req.body.token){
                            req.params.subid = device.id;
                        }
                    });
                    if (req.body.remove){
                        //console.log("remove");
                        Remove(req, res, next);
                    }else{
                        //console.log("Update");
                        Update(req, res, next);
                    }
                }else{
                    user.devices.forEach(function(device) {
                        if(device.token == req.body.token){
                            var subDoc = user[req.params.sub].id(device.id);
                            subDoc.remove();
                        }
                    });
                    user.save();
                }
            });
            if(!req.params.subid){
                Create(req, res, next);
            }
        });
    }else{
        res.json(400, {});
    }
};