// Get single Group
// ---------------------------------------------
// Retrun user profile info except password

var Group = require('mongoose').model('Group');

var populateField = {
    _owner: 'type firstName lastName title cover photo',
    invited: 'type firstName lastName title cover photo',
    participants: 'type firstName lastName title cover photo'
};

module.exports = function(req, res, next) {

    // check on logic delete flag, return 404 on not found

    Group.findById(req.params.group)
        .select('-logicDelete')
        .where('logicDelete').equals(false)
        .populate('_owner', populateField['_owner'])
        .exec(function(err, group) {
            if (err) next(err);
            else res.json(group);
        });
};