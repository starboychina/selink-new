var Group = require('mongoose').model('Group');

module.exports = function(req, res, next) {

    Group.find({}, function(err, groups) {

        if (err) next(err);
        else {

            groups.forEach(function(group) {
                solr.add(group.toSolr(), function(err, solrResult) {
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
                text: 'Group index successed.'
            });
        }
    });
};