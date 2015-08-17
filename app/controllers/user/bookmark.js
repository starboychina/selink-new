// User's bookmark
var _ = require('underscore'),
    mongoose = require('mongoose'),
    Post = mongoose.model('Post'),
    Job = mongoose.model('Job');

module.exports = function(req, res, next) {

    // page number
    var page = req.query.page || 0;

    Post.find()
        .where('logicDelete').equals(false)
        .where('bookmark').equals(req.user.id)
        .populate('_owner', 'type nickName firstName lastName title cover photo createDate')
        .populate('comments._owner', 'type nickName firstName lastName title cover photo createDate')
        .populate('group', 'name cover description')
        .sort('-createDate')
        .skip(10*page)  // skip n page
        .limit(10)
        .exec(function(err, posts) {
            if (err) next(err);
            else if (posts.length === 0) res.json(404, {});
            else {

                Job.find()
                    .where('logicDelete').equals(false)
                    .where('bookmark').equals(req.user.id)
                    .populate('_owner', 'type firstName lastName title cover photo createDate')
                    .sort('-createDate')
                    .skip(10*page)  // skip n page
                    .limit(10)
                    .exec(function(err, jobs) {
                        if (err) next(err);
                        else if (jobs.length === 0) res.json(404, {});
                        else res.json(_.union(jobs, posts));
                    });
            }
        });
};
