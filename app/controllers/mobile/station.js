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

    Line.find(req.body,oneStation,function(err,lines){
    	if(err){res.json(404, {});}
    	res.json(200, lines);
    });
    //res.json(400, "ok");
    return;
};