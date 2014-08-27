// Events count
// ---------------------------------------------
// Return the future events number of current user, in request specified criteria.
// ---------------------------------------------
// Parameter:
//   1. user  : The user's id of events list belong to, passed by url  default: current user
//   2. group : The group's id of events list belong to, passed by url default: none
// ---------------------------------------------

var Event = require('mongoose').model('Event');

module.exports = function(req, res, next) {

    // create query
    var query = Event.count();

    // if request specified user
    if (req.params.user && req.params.user !== req.user.id)
        query.where('_owner').eq(req.params.user);

    // if request specified group
    else if (req.params.group)
        query.where('group').eq(req.user.groups);

    // default to current user and his group
    else
        query.or([{_owner: req.user.id}, {group: {$in: req.user.groups}}]);

    query.where('start').gt(new Date())
        .where('logicDelete').equals(false)
        .exec(function(err, count) {
            if (err) next(err);
            else res.json({count: count});
        });
};