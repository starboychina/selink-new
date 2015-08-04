var User = require('mongoose').model('User');

module.exports = function(req, res, next) {

    // create query
    var query = User.find();
    // if request items before some time point
    if (req.query.before)
        query.where('createDate').lt(moment.unix(req.query.before).toDate());

    query.select()
        .where('_id').in(req.user.invited)
        .where('logicDelete').equals(false)
        .limit(req.query.size || 20)
        .sort('-createDate')
        .exec(function(err, users) {
            if (err) next(err);
            else if (users.length === 0) res.json(404, {});
            else res.json(users);
        });

};