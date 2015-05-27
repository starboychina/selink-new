// Create new sub document
var mongoose = require('mongoose'),
	Station = mongoose.model('Station');
module.exports = function(req, res, next) {

	var condition_station = {};
	for (var index in req.query) {
		condition_station[index] = index=="_id"? req.query[index]: new RegExp('^'+req.query[index]+'$', "i");
	};

	var query = Station.find(condition_station);
		query.exec(function(err, stations) {
		            if (err) next(err);
		            else if (stations.length === 0) res.json(404, {});
		            else {
    					res.json(200, stations);
		            }
		        });
    //res.json(400, "ok");
    return;
};