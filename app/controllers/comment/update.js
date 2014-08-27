// Update comment
// ---------------------------------------------
// Update new comment, and return it
// ---------------------------------------------
// 1. find post with its Id
// 2. update comment in the post's comments list
// 3. return the full representation of the comment to client

var async = require('async'),
    mongoose = require('mongoose'),
    Post = mongoose.model('Post'),
    User = mongoose.model('User');

var populateField = {
    '_owner': 'type firstName lastName title cover photo',
    'replyTo': 'type firstName lastName title cover photo'
};

module.exports = function(req, res, next){

    // TODO: check ownership

    async.waterfall([

        // find the post
        function findPost(callback) {
            Post.findById(req.params.post, callback);
        },

        // update the comment
        function updateComment(post, callback) {

            post.comments.id(req.params.comment).set('content', req.body.content);

            post.save(function(err, post) {
                if (err) callback(err);
                else callback(null, post.comments.id(req.params.comment));
            });
        },

        // populate the comment for return
        function populateComment(comment, callback) {

            // "_owner" was not populated cause we know the owner is the current user
            User.populate(comment, {
                path:'replyTo',
                select: populateField['replyTo']
            }, callback);
        }

    ], function(err, comment) {

        if (err) next(err);
        // return the created comment
        else res.json(comment);
    });
};