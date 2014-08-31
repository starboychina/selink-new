// Update Job
var _ = require('underscore'),
    Job = require('mongoose').model('Job');

module.exports = function(req, res, next) {

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