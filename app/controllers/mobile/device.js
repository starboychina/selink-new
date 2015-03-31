// Create new sub document
var User = require('mongoose').model('User'),
    Create = require('../user/createSubDocument'),
    Update = require('../user/updateSubDocument');

module.exports = function(req, res, next) {
    //req.body = req.query; テスト
    req.params.id = req.session.userId;
    req.params.sub = "devices";
    if (req.body.uuid){
        User.findById(req.params.id, function(err, user) {
            //res.json(400, user);
            if (err) next(err);
            else {
                user.devices.forEach(function(device) {
                    if(device.uuid == req.body.uuid){
                        req.params.subid = device.id;
                    }
                });
                if(req.params.subid){
                    Update(req, res, next);
                }else{
                    Create(req, res, next);
                }
            }
        });
    }else{
        res.json(400, {});
    }
};