module.exports = function(req, res, next) {
	var condition = {};
	if (condition.length>0){
		res.json(condition.length);
	}else{
		res.json("condition.length");
	}
}