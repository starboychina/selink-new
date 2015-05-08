// Get single user
// ---------------------------------------------
// Retrun user profile info except password
var User = require('mongoose').model('User');

module.exports = function(req, res, next) {

    // check on logic delete flag, return 404 on not found

    User.findById(req.session.userId, 'openids')
    .populate('groups','_owner type name cover description participants createDate')
    .exec( function(err, user) {
        if (err) next(err);
        else{
        	var openids = user.openids;
        	res.json(openids);
        } 
    });
};