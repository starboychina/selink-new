// Create new sub document
var Line = require('mongoose').model('Line');

module.exports = function(req, res, next) {
	req.body = req.query; //テスト
	var oneStation = {};
	for (var index in req.body) {
		if ( /stations./.test(index)){
			oneStation = {
				'name':true,
				'pref':true,
				'stations.$': true};
			break;
		}
	};

	var query = Line.find(req.body,oneStation);
		query.populate('stations')
		        .exec(function(err, posts) {
		            if (err) next(err);
		            else if (posts.length === 0) res.json(404, {});
		            else {
    					res.json(200, posts);
		            }
		        });
    //res.json(400, "ok");
    return;
};