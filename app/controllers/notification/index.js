/*
    Notification Type:
    1. friend-invited
    2. friend-approved
    3. friend-declined
    4. friend-break
    5. post-new
    6. post-liked
    7. post-bookmarked
    8. post-commented
    9. comment-replied
    10. comment-liked
    11. job-new
    12. job-bookmarked
    13. message-new
    14. group-new
    15. group-invited
    16. group-joined
    17. group-refused
    18. group-applied
    19. group-approved
    20. group-declined
*/

// Notification index
// ---------------------------------------------
// Return a list of 20 notifications of current user, in descending order of create date.
// Notifications are private, all requests are relate to current user and can't be changed
// ---------------------------------------------
// Parameter:
//   1. type  : The type of notifications, "unconfirmed" or "all"  default: all
//   2. before: A Unix time stamp used as start point of retrive   default: none
//   3. size  : Number of result to return                         default: 20
// ---------------------------------------------
var _s = require('underscore.string'),
    moment = require('moment'),
    Notification = require('mongoose').model('Notification');

var populateField = {
    '_from': 'type firstName lastName title cover photo'
};

module.exports = function(req, res, next) {

    // create query
    var query = Notification.find();

    // notifications are relate with current user
    query.where('_owner').equals(req.user.id);

    // if request specified unconfirmed notifications
    if (_s.endsWith(req.path, "/unconfirmed"))
        query.where('confirmed').ne(req.user.id);

    // if request items before some time point
    if (req.query.before)
        query.where('createDate').lt(moment.unix(req.query.before).toDate());

    query.select('-logicDelete')
        .where('logicDelete').equals(false)
        .populate('_from', populateField['_from'])
        .populate('targetPost')
        .populate('targetJob')
        .populate('targetMessage')
        .populate('targetGroup')   // there is no targetComment, cause comment was embedded in post
        .limit(req.query.size || 20)
        .sort('-createDate')
        .exec(function(err, notifications) {
            if (err) next(err);
            else if (notifications.length === 0) res.json(404, {});
            else res.json(notifications);
        });

};