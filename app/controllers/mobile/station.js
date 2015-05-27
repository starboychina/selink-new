// Create new sub document
var mongoose = require('mongoose'),
	Station = mongoose.model('Station'),
	Group = mongoose.model('Group');
module.exports = function(req, res, next) {
	if(Object.keys(req.query).length == 0){
		gethotStations(req, res, next);
		return;
	}else{
		getStations(req, res, next);
	}
};
function gethotStations(req, res, next){

	var aggregate = Group.aggregate();
	aggregate.append({$project: {
	         station: 1,
	         type: 1,
	         psize: {$size: "$participants"}
	    }});
	aggregate.append({ $match: { type: 'station' }} );
	aggregate.append({ $sort : { 'psize' : -1,'_id' : 1}});
    aggregate.exec(function(err, groups) {
    	var stationids = new Array();
    	for (var i = groups.length - 1; i >= 0; i--) {
    		stationids.push(groups[i].station);
    	};
    	Station.find({_id:{"$in":stationids}})
		    	.limit(req.query.size || 20)
		    	.exec(function(err, stations) {
			        if (err) next(err);
			        else if (stations.length === 0) res.json(404, {});
			        else {
						res.json(200, stations);
			        }
			    });
    });
}
function getStations(req, res, next){
	var condition_station = {};
	for (var index in req.query) {
		condition_station[index] = index=="_id"? req.query[index]: new RegExp('^'+req.query[index]+'$', "i");
	};

	Station.find(condition_station,function(err, stations) {
        if (err) next(err);
        else if (stations.length === 0) res.json(404, {});
        else {
			res.json(200, stations);
        }
    });
}
