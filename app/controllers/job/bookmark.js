// bookmark job
var mongoose = require('mongoose'),
    Job = mongoose.model('Job'),
    Activity = mongoose.model('Activity'),
    Notification = mongoose.model('Notification');

module.exports = function(req, res, next){

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