var User = require('mongoose').model('User');

module.exports = function(req, res, next) {

    User.find({}, function(err, users) {

        if (err) next(err);
        else {

            users.forEach(function(user) {
                solr.add(user.toSolr(), function(err, solrResult) {
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
                text: 'User index successed.'
            });
        }
    });
};