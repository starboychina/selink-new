var _ = require('underscore'),
    _s = require('underscore.string'),
    util = require('util'),
    Mailer = require('../mailer/mailer.js'),
    mongoose = require('mongoose'),
    Job = mongoose.model('Job'),
    User = mongoose.model('User'),
    Activity = mongoose.model('Activity'),
    Notification = mongoose.model('Notification');

// Job Index
exports.index = function(req, res, next) {

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

// Show single job
exports.show = function(req, res, next) {

    Job.findById(req.params.job)
        .where('logicDelete').equals(false)
        .populate('_owner', 'type firstName lastName title cover photo createDate')
        .exec(function(err, posts) {
            if (err) next(err);
            else res.json(posts);
        });
};

// Create Job
exports.create = function(req, res, next) {

    // set job's owner as current user
    _.extend(req.body, {_owner: req.user.id});

    // create job
    Job.create(req.body, function(err, job) {

        if (err) next(err);
        else {

            // create activity
            Activity.create({
                _owner: req.user.id,
                type: 'job-new',
                targetJob: job._id
            }, function(err, activity) {
                if (err) next(err);
            });

            // create notification for job owner's friend
            Notification.create({
                _owner: req.user.friends,
                _from: req.user.id,
                type: 'job-new',
                targetJob: job.id
            }, function(err, notification) {

                if (err) next(err);
                else {

                    var notyPopulateQuery = [{
                        path:'_from',
                        select: 'type firstName lastName title cover photo createDate'
                    },{
                        path:'targetJob'
                    }];

                    // populate the respond notification with user's info
                    notification.populate(notyPopulateQuery, function(err, noty) {
                        if(err) next(err);
                        // send real time message
                        else
                            req.user.friends.forEach(function(room) {
                                sio.sockets.in(room).emit('job-new', noty);
                            });
                    });
                }
            });

            // send email to all friends
            User.find()
                .select('email')
                .where('_id').in(req.user.friends)
                .where('logicDelete').equals(false)
                .exec(function(err, users) {
                    // send new-job mail
                    Mailer.newJob(users, {
                        _id: job._id,
                        authorName: req.user.firstName + ' ' + req.user.lastName,
                        authorPhoto: req.user.photo,
                        name: job.name,
                        summary: job.remark
                    });
                });

            // send saved job back
            job.populate('_owner', 'type firstName lastName title cover photo createDate', function(err, job) {

                if (err) next(err);
                else {

                    // index job in solr
                    solr.add(job.toSolr(), function(err, solrResult) {
                        if (err) next(err);
                        else {
                            console.log(solrResult);
                            solr.commit(function(err,res){
                               if(err) console.log(err);
                               if(res) console.log(res);
                            });
                        }
                    });

                    res.json(job);
                }
            });

        }
    });

};

// Update Job
exports.update = function(req, res, next) {

    // TODO: check ownership

    var newJob = _.omit(req.body, '_id');

    Job.findByIdAndUpdate(req.params.job, newJob, function(err, job) {
        if (err) next(err);
        else {

            // send saved job back
            job.populate('_owner', 'type firstName lastName title cover photo createDate', function(err, job) {

                if (err) next(err);
                else {

                    // index job in solr
                    solr.add(job.toSolr(), function(err, solrResult) {
                        if (err) next(err);
                        else {
                            console.log(solrResult);
                            solr.commit(function(err,res){
                               if(err) console.log(err);
                               if(res) console.log(res);
                            });
                        }
                    });

                    res.json(job);
                }
            });
        }
    });
};

// Remove Job
exports.remove = function(req, res, next) {

    // TODO: check ownership

    Job.findByIdAndUpdate(req.params.job, {logicDelete: true}, function(err, job) {
        if (err) next(err);
        else {

            // remove this job in solr
            solr.delete('id', job.id, function(err, solrResult) {
                if (err) next(err);
                else {
                    solr.commit(function(err,res){
                       if(err) console.log(err);
                       if(res) console.log(res);
                    });
                }
            });

            res.json(job);
        }
    });
};

exports.news = function(req, res, next) {

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

// bookmark job
exports.bookmark = function(req, res, next){

    // find job
    Job.findById(req.params.job, function(err, job) {

        if (err) next(err);
        else {

            // add one bookmarked people id
            job.bookmarked.addToSet(req.body.bookmarked);

            // save the job
            job.save(function(err, newJob) {

                if (err) next(err);
                else {

                    // if someone not job owner bookmarked this job
                    if (newJob._owner != req.user.id) {

                        // create activity
                        Activity.create({
                            _owner: req.body.bookmarked,
                            type: 'job-bookmarked',
                            targetJob: newJob._id
                        }, function(err, activity) {
                            if (err) next(err);
                        });

                        // create notification for job owner
                        Notification.create({
                            _owner: [newJob._owner],
                            _from: req.body.bookmarked,
                            type: 'job-bookmarked',
                            targetJob: newJob._id
                        }, function(err, notification) {

                            if (err) next(err);
                            else {

                                var notyPopulateQuery = [{
                                    path:'_from',
                                    select: 'type firstName lastName title cover photo createDate'
                                },{
                                    path:'targetJob'
                                }];

                                // populate the respond notification with user's info
                                notification.populate(notyPopulateQuery, function(err, noty) {
                                    if(err) next(err);
                                    // send real time message
                                    sio.sockets.in(newJob._owner).emit('job-bookmarked', noty);
                                });
                            }
                        });
                    }

                    // return the saved job
                    res.json(newJob);
                }
            });
        }
    });
};

exports.match = function(req, res, next) {

    // find job
    Job.findById(req.params.job, function(err, job) {

        if (err) next(err);
        else if (job.languages.length === 0 && job.skills.length === 0) res.json([]);
        else {

            var languages = _.map(job.languages, function(language) {
                return language.language;
            });

            var skills = _.map(job.skills, function(skill) {
                return skill.skill;
            });

            var solrQuery = solr.createQuery()
                                .defType('payloadqueryparser')
                                .q(_.union(languages, skills).join(" +"))
                                .fl('id,score')
                                .fq('type:User AND -id:' + job._owner)
                                .qf({language: 1, skill: 1})
                                .plf('language,skill');

            console.log(solrQuery.build());

            solr.search(solrQuery, function(err, obj) {
                if (err) console.log(err);
                else {

                    console.log("#################");
                    console.log(util.inspect(obj));
                    console.log(util.inspect(obj.response.docs));
                    console.log("#################");

                    if (obj.response.numFound > 0)
                        User.find()
                            .select('type firstName lastName title cover photo createDate')
                            .where('_id').in(_.pluck(obj.response.docs, 'id'))
                            .exec(function(err, users) {
                                if (err) next(err);
                                else {

                                    // NOTE: this sucks, the 'in' query in mongodb messed up the socre order
                                    var result = [];

                                    users.forEach(function(user) {
                                        var userObj = user.toObject();
                                        // paste socre in result list, let client sort the result
                                        // TODO: return the numFound
                                        // use user.id in findWhere because it's string, userObj._id don't work
                                        userObj.score = _.findWhere(obj.response.docs, {id: user.id}).score;
                                        result.push(userObj);
                                    });

                                    res.json(result);
                                }
                            });
                    else res.json([]);
                }
            });
        }
    });
};