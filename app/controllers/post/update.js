// Update post
// ---------------------------------------------
// Update a post, and return the updated post
// ---------------------------------------------
// 1. find post with its Id
// 2. update the post
// 3. update the post in solr
// 4. return the full representation of the post to client

var async = require('async'),
    Post = require('mongoose').model('Post');

var populateField = {
    '_owner': 'type firstName lastName title cover photo',
    'comments._owner': 'type firstName lastName title cover photo',
    'group': 'name cover description'
};

module.exports = function(req, res, next){

    // TODO: check post's ownership

    async.waterfall([

        // find the post and update it
        function updatePost(callback) {
            if (req.body.content) {
                req.body.contentText = req.body.content;
            }
            Post.findByIdAndUpdate(req.params.post, req.body, callback);
        },

        // update solr
        function updateSolr(post, callback) {

            solr.add(post.toSolr(), function(err, result) {
                if (err) callback(err);
                else solr.commit(function(err, result) {
                    if (err) callback(err);
                    else callback(null, post);
                });
            });
        },

        // get the full representation of the post
        function populatePost(post, callback) {

            var setting = [{
                    path:'_owner',
                    select: populateField['_owner']
                },{
                    path:'group',
                    select: populateField['group']
                },{
                    path:'comments._owner',
                    select: populateField['comments._owner']
                }];

            // get the full representation of the post
            post.populate(setting, callback);
        }

    ], function(err, post) {

        if (err) next(err);
        // return the updated post
        else res.json(post);
    });

};