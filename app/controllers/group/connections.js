// Group Connection
// ---------------------------------------------
// Return 20 people's info of the group member/invited member in descending order of create date.
// ---------------------------------------------
// Parameter:
//   1. group : The group id of user list belong to, passed by url           default: none
//   2. type  : The type of member, identified by the path of request        default: participants
//                a. participants  -- the groups belong to user
//                b. invited       -- the groups user had joined
//   3. before: A Unix time stamp used as start point of retrive             default: none
//   4. size  : Number of result to return                                   default: 20
// ---------------------------------------------

var _s = require('underscore.string'),
    Group = require('mongoose').model('Group');

var populateField = {
    _owner: 'type firstName lastName title cover photo',
    invited: 'type firstName lastName title cover photo',
    participants: 'type firstName lastName title cover photo'
};

module.exports = function(req, res, next) {

    // TODO: check parameters

    // create query
    var query = Group.findById(req.params.group)
                    .where('logicDelete').equals(false);

    // if request invited people
    if (_s.endsWith(req.path, "/invited"))
        query.select('invited')
            .populate('invited', populateField['invited'])
            .exec(function(err, group) {
                if (err) next(err);
                else res.json(group.invited);
            });

    // default to participants
    else
        query.select('participants')
            .populate('participants', populateField['participants'])
            .exec(function(err, group) {
                if (err) next(err);
                else res.json(group.participants);
            });

};