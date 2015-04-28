// Create new sub document
var mongoose = require('mongoose'),
	Line = mongoose.model('Line');
module.exports = function(req, res, next) {
	req.body = req.query; //テスト

	var condition_line = {};
	var condition_station = {};
	for (var index in req.body) {
		if ( /stations./.test(index)){
			var key = index.replace(/stations./,"");
			condition_station[key] = new RegExp('^'+req.body[index]+'$', "i");
		}else{
			condition_line[index] = new RegExp('^'+req.body[index]+'$', "i");
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