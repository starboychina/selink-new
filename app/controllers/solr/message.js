var Message = require('mongoose').model('Message');

module.exports = function(req, res, next) {

    Message.find({}, function(err, messages) {

        if (err) next(err);
        else {

            messages.forEach(function(message) {
                solr.add(message.toSolr(), function(err, solrResult) {
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
                text: 'Message index successed.'
            });
        }
    });
};