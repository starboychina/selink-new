var Post = require('mongoose').model('Post');

module.exports = function(req, res, next) {

    Post.find({}, function(err, posts) {

        if (err) next(err);
        else {

            posts.forEach(function(post) {
                solr.add(post.toSolr(), function(err, solrResult) {
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
                text: 'Post index successed.'
            });
        }
    });
};