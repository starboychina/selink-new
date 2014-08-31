// Show single job
var Job = require('mongoose').model('Job');

module.exports = function(req, res, next) {

    Job.findById(req.params.job)
        .where('logicDelete').equals(false)
        .populate('_owner', 'type firstName lastName title cover photo createDate')
        .exec(function(err, posts) {
            if (err) next(err);
            else res.json(posts);
        });
};