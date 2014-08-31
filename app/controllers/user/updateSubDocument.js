// Edit sub document
var User = require('mongoose').model('User');

module.exports = function(req, res, next) {

    User.findById(req.params.id, function(err, user) {
        if (err) next(err);
        else {

            var subDoc = user[req.params.sub].id(req.params.subid);

            if (subDoc) {

                for(var prop in req.body) {
                    subDoc[prop] = req.body[prop];
                }

                user.save(function(err, updatedUser) {
                    if (err) next(err);
                    else {

                        // index user in solr
                        solr.add(updatedUser.toSolr(), function(err, solrResult) {
                            if (err) next(err);
                            else {
                                console.log(solrResult);
                                solr.commit(function(err,res){
                                   if(err) console.log(err);
                                   if(res) console.log(res);
                                });
                            }
                        });

                        res.send(subDoc);
                    }

                });
            } else {
                res.json(404, {});
            }
        }
    });

};