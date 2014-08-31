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

    req.session.destroy();
    res.redirect('/');
};