var User = require('mongoose').model('User');

module.exports = function(req, res, next) {

    var initial = req.query.initial;

    User.find({_id: {'$ne': req.user._id}})
        .or([{firstName: new RegExp(initial, "i")}, {lastName: new RegExp(initial, "i")}])
        .where('logicDelete').equals(false)
        .select('firstName lastName photo')
        .limit(8)
        .exec(function(err, users) {
            if (err) next(err);
            else res.json(users);
        });
};