// Notification count
// ---------------------------------------------
// Return the number notifications of current user, in request specified criteria.
// Notifications are private, all requests are relate to current user and can't be changed
// ---------------------------------------------
// Parameter:
//   1. type  : The type of notifications, "unconfirmed" or "all"  default: all
// ---------------------------------------------
var _s = require('underscore.string'),
    Notification = require('mongoose').model('Notification');

module.exports = function(req, res, next) {

    // create query
    var query = Notification.count();

    // notifications are relate with current user
    query.where('_owner').equals(req.user.id);

    // if request specified unconfirmed notifications
    if (_s.endsWith(req.path, "/unconfirmed/count"))
        query.where('confirmed').ne(req.user.id);

    query.where('logicDelete').equals(false)
        .exec(function(err, count) {
            if (err) next(err);
            else res.json({count: count});
        });
};