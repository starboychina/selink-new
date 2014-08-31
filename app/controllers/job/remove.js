// Remove Job
var Job = require('mongoose').model('Job');

module.exports = function(req, res, next) {

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
