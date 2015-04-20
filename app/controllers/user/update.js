// Edit Profile
var User = require('mongoose').model('User');

module.exports = function(req, res, next) {

    delete req.body._id;
    req.body.bioText =  (req.body.bio)? req.body.bio.replace(/<[^>]*>/g, ''):'';
    // update user info
    User.findByIdAndUpdate(req.params.id, req.body, function(err, updatedUser) {

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

            res.send(updatedUser);
        }
    });
};