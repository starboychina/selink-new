// Group index
// ---------------------------------------------
// Return latest 20 groups of current user in descending order of create date.
// In the case of get some user's groups list, user id must passed by the route: '/users/:user/groups'
// ---------------------------------------------
// Parameter:
//   1. user  : The user's id of groups list belong to, passed by url        default: current user
//   2. type  : The type of groups, identified by the path of request        default: joined
//                a. mine     -- the groups belong to user
//                b. joined   -- the groups user had joined
//                c. discover -- the groups that have no connection to user
//   3. before: A Unix time stamp used as start point of retrive             default: none
//   4. size  : Number of result to return                                   default: 20
// ---------------------------------------------

var _s = require('underscore.string'),
    moment = require('moment'),
    mongoose = require('mongoose'),
    Group = mongoose.model('Group'),
    User = mongoose.model('User');

module.exports = function(req, res, next) {

    // TODO: check parameters

    // if the request was get some specific user's groups list
    // we need to get the user from users collection

    // if specified someone other than current user
    if (req.params.user && req.params.user !== req.user.id) {

        // get the user's groups info (group ids)
        User.findById(req.params.user, 'groups', function(err, uesr) {
            // pass the user to internal method
            if (err) next(err);
            else _group_index(req, res, uesr, next);
        });

    } else {

        // no specified user, pass null to internal method
        _group_index(req, res, req.user, next);
    }
};

// internal method for index
_group_index = function(req, res, user, next) {

    // create query
    var query = Group.find();

    // if request "mine" groups
    if (_s.endsWith(req.path, "/mine"))
        query.where('_owner').equals(user.id);

    // if request "discover" groups
    else if (_s.endsWith(req.path, "/discover"))
        query.where('_id').nin(user.groups)
            .where('type').ne('private');

    // default to joined groups
    else
        query.where('_id').in(user.groups);

    // if request items before some time point
    if (req.query.before)
        query.where('createDate').lt(moment.unix(req.query.before).toDate());

    query.select('_owner type name cover description participants posts events createDate')
        .where('logicDelete').equals(false)
        .where( {'type':{'$ne':"station"}})
        .limit(req.query.size || 20)
        .sort('-createDate')
        .exec(function(err, groups) {
            if (err) next(err);
            else if (groups.length === 0) res.json(404, {});
            else res.json(groups);
        });
};