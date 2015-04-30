// Create new sub document
var mongoose = require('mongoose'),
	Line = mongoose.model('Line');
module.exports = function(req, res, next) {

	var condition_line = {};
	var condition_station = {};
	for (var index in req.query) {
		if ( /station(s)?\./.test(index)){
			var key = index.replace(/station(s)?\./,"");
			condition_station[key] = key=="_id"? req.query[index]: new RegExp('^'+req.query[index]+'$', "i");
		}else{
			condition_line[index] = index=="_id"? req.query[index]: new RegExp('^'+req.query[index]+'$', "i");
		}
	};

	var query = Line.find(condition_line);
		query.populate('stations',{},condition_station)
		        .exec(function(err, lines) {
		            if (err) next(err);
		            else if (lines.length === 0) res.json(404, {});
		            else {
		            	 lines = lines.filter(function(line){
						     return line.stations.length;
						   })
    					res.json(200, lines);
		            }
		        });
    //res.json(400, "ok");
    return;
};