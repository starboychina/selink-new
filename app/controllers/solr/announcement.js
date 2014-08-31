var Announcement = require('mongoose').model('Announcement');

module.exports = function(req, res, next) {

    Announcement.find({}, function(err, announcements) {

        if (err) next(err);
        else {

            announcements.forEach(function(announcement) {
                solr.add(announcement.toSolr(), function(err, solrResult) {
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
                text: 'Announcement index successed.'
            });
        }
    });
};