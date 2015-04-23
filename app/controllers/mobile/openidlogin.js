// Create new sub document
var User = require('mongoose').model('User');

module.exports = function(req, res, next) {
    req.body = req.query; //テスト
    if (req.body.openid){
    	var param = {
    		"openids.openid":req.body.openid,
    		"openids.type":req.body.type
    	};
	    User.findOne(param,{"_id":true},function(err,users){
	    	if (err) next(err);
	        else if (users.length === 0) res.json(401, {});
	        res.json(200,users)
	    });
    }else{
        res.json(401, {});
    }
};