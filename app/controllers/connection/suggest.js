var User = require('mongoose').model('User');

module.exports = function(req, res, next) {

    var initial = req.query.initial;

    User.find({_id: {'$ne': req.user._id}})
        .or([{firstName: new RegExp(initial, "i")}, {lastName: new RegExp(initial, "i")}])
        .select('firstName lastName bio photo')
        .limit(8)
        .exec(function(err, users) {
            if (err) next(err);
            else
            // return the user
            res.json(users);
        });
};