// Create new sub document
var Line = require('mongoose').model('Line');

module.exports = function(req, res, next) {
	req.body = req.query; //テスト
    Line.find(req.body,function(err,lines){
    	if(err){res.json(404, {});}
    	res.json(200, lines);
    });
    //res.json(400, "ok");
    return;
};