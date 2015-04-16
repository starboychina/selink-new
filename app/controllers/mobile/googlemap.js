var push = require('../../utils/push');

module.exports = function(req, res, next) {
	res.render('./map/googlemap', req.user);
}