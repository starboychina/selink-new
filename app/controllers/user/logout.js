// User logout
var mongoose = require('mongoose'),
    Activity = mongoose.model('Activity'),
    User = mongoose.model('User');

module.exports = function(req, res, next) {

    if (req.query.token){

        User.findById(req.session.userId, function(err, user){

            user.devices.forEach(function(device) {
                if(device.token == req.query.token){
                    
                    device.remove();

                    user.save();
                }
            });
        });
    }
    // create activity
    Activity.create({
        _owner: req.session.userId,
        type: 'user-logout'
    }, function(err, activity) {
        if (err) next(err);
    });
	
    req.session.destroy();
    res.redirect('/');
};