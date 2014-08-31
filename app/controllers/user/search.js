// Search
var util = require('util');

module.exports = function(req, res, next) {

    var page = req.query.page || 0,  // page number
        term = req.query.term,       // search
        solrQuery = solr.createQuery()  // TODO: check search term
                        .q(req.query.term)
                        .fl('type,id,score')
                        .start(10*page)
                        .rows(10);
                        // .fq('type:user AND -id:' + job._owner)
                        // .qf({language: 1, skill: 1})
                        // .plf('language,skill');

    console.log(solrQuery.build());

    solr.search(solrQuery, function(err, obj) {
        if (err) console.log(err);
        else {

            console.log("#################");
            console.log(util.inspect(obj));
            console.log(util.inspect(obj.response.docs));
            console.log("#################");

            res.json(obj.response.docs);
        }
    });
};