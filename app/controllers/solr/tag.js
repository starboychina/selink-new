var Tag = require('mongoose').model('Tag');

module.exports = function(req, res, next) {

    Tag.find({}, function(err, tags) {

        if (err) next(err);
        else {

            tags.forEach(function(tag) {
                solr.add(tag.toSolr(), function(err, solrResult) {
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
                text: 'Tag index successed.'
            });
        }
    });
};