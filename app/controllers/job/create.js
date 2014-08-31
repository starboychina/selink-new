// Create Job
var _ = require('underscore'),
    Mailer = require('../../mailer/mailer.js'),
    mongoose = require('mongoose'),
    Job = mongoose.model('Job'),
    User = mongoose.model('User'),
    Activity = mongoose.model('Activity'),
    Notification = mongoose.model('Notification');

module.exports = function(req, res, next) {

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