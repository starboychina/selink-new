// Events index
// ---------------------------------------------
// Return a list of 20 events of current user, in descending order of start date.
// You can get the events in a specific time span, by using the "from" and "to" parameter
// In the case of get some user's events list, user id must passed by the route: '/users/:user/events'
// In the case of get some group's events list, group id must passed by the route: '/groups/:group/events'
// ---------------------------------------------
// Parameter:
//   1. user  : The user's id of posts list belong to, passed by url   default: current user
//   2. group : The group's id of posts list belong to, passed by url  default: none
//   3. start : A Unix timestamp for start point of a time span        default: none
//   4. end   : A Unix timestamp for end point of a time span          default: none
//   5. after : A Unix time stamp used as start point of retrive       default: none
//   6. size  : Number of result to return                             default: 20
// ---------------------------------------------

var moment = require('moment'),
    Event = require('mongoose').model('Event');

var populateField = {
    'group': 'name cover description'
};

module.exports = function(req, res, next) {

    // create query
    var query = Event.find();

    // if request specified user
    if (req.params.user && req.params.user !== req.user.id)
        query.where('_owner').equals(req.params.user);

    // if request specified group
    else if (req.params.group)
        query.where('group').equals(req.params.group);

    // default to current user and his group
    else
        query.or([{_owner: req.user.id}, {group: {$in: req.user.groups}}]);

    // if request specified time span start point
    if (req.query.start)
        query.where('start').gt(moment.unix(req.query.start).toDate());

    // if request specified time span end point
    if (req.query.end)
        query.where('start').lt(moment.unix(req.query.end).toDate());

    // if request items after some time point
    // note that the "limit" will affect query only in this case
    if (req.query.after) {
        query.where('start').gt(moment.unix(req.query.after).toDate())
            .limit(req.query.size || 20);
    }

    query.select('-logicDelete')
        .where('logicDelete').equals(false)
        .populate('group', populateField['group'])
        .sort('start')
        .exec(function(err, events) {
            if (err) next(err);
            else if (events.length === 0) res.json(404, {});
            else res.json(events);
        });

};