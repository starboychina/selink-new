// Get single user
// ---------------------------------------------
// Retrun user profile info except password
var User = require('mongoose').model('User');

module.exports = function(req, res, next) {

    // check on logic delete flag, return 404 on not found

    User.findById(req.params.user, '-password -logicDelete -openids', function(err, user) {
        if (err) next(err);
        else res.json(user);
    });
};