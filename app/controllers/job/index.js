// Job Index
var Job = require('mongoose').model('Job');

module.exports = function(req, res, next) {

    // page number
    var page = req.query.page || 0;

    var query = Job.find();

    query.where('_owner').equals(req.user.id)
        .where('logicDelete').equals(false)
        .populate('_owner', 'type firstName lastName title cover photo createDate')
        .skip(20*page)  // skip n page
        .limit(20)
        .sort('-createDate')
        .exec(function(err, jobs) {
            if (err) next(err);
            else res.json(jobs);
        });
};