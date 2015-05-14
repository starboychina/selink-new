//google map
module.exports = function(req, res, next) {
	res.render('./map/googlemap', req.user);
}