// User logout
var Activity = require('mongoose').model('Activity');

module.exports = function(req, res, next) {

    // create activity
    Activity.create({
        _owner: req.session.userId,
        type: 'user-logout'
    }, function(err, activity) {
        if (err) next(err);
    });

	if (req.body.token){
        console.log(req.user.devices)
		req.user.devices.forEach(function(device) {

            console.log(device)
            console.log(token)
            if(device.token == req.body.token){
            	req.user.devices.pull(device);
            }
        });
	}
	
    req.session.destroy();
    res.redirect('/');
};