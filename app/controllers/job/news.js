var Job = require('mongoose').model('Job');

module.exports = function(req, res, next) {

    Job.find()
        .where('logicDelete').equals(false)
        .where('expiredDate').gt(new Date())
        .populate('_owner', 'type firstName lastName title cover photo createDate')
        .sort('-createDate')
        .exec(function(err, jobs) {
            if (err) next(err);
            res.json(jobs);
        });
};
