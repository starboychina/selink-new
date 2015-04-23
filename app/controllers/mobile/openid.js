// Create new sub document
var User = require('mongoose').model('User'),
    Create = require('../user/createSubDocument'),
    Update = require('../user/updateSubDocument');

module.exports = function(req, res, next) {
    req.body = req.query; //テスト
    req.params.id = req.session.userId;
    req.params.sub = "openids";
    if (req.body.openid){
        User.findById(req.params.id, function(err, user) {
            if (err) next(err);
            else {
                user.openids.forEach(function(openid) {
                    if(openid.openid == req.body.openid && openid.type == req.body.type){
                        req.params.subid = openid.id;
                    }
                });
                if(req.params.subid){
                    Update(req, res, next);
                }else{
			    	var param = {
			    		"openids.openid":req.body.openid,
			    		"openids.type":req.body.type
			    	};
                	User.find(param,{"_id":true},function(err,users){
				    	if (err) next(err);
				        else if (users.length > 0) res.json(401, users);
				        else Create(req, res, next);
				    });

                }
            }
        });
    }else{
        res.json(400, {});
    }
};