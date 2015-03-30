// Create new sub document
var User = require('mongoose').model('User'),
    Create = require('../user/createSubDocument');
    Update = require('../user/updateSubDocument');

module.exports = function(req, res, next) {

    User.findById(req.params.id, function(err, user) {
        if (err) next(err);
        else {

            req.params.sub = "devices"

            user.devices.forEach(function(device) {
                if(device.uuid == req.body.uuid){
                    req.params.subid = device.id
                }
            });
            if(req.params.subid){
                Update(req, res, next)
            }else{
                Create(req, res, next)
            }
        }
    });
};