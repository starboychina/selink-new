var Job = require('mongoose').model('Job');

module.exports = function(req, res, next) {

    Job.find({}, function(err, jobs) {

        if (err) next(err);
        else {

            jobs.forEach(function(job) {
                solr.add(job.toSolr(), function(err, solrResult) {
                    if (err) next(err);
                    else console.log(solrResult);
                });
            });

            solr.commit(function(err, res) {
                if(err) console.log(err);
                if(res) console.log(res);
            });

            res.json({
                title: 'Success',
                text: 'Job index successed.'
            });
        }
    });
};