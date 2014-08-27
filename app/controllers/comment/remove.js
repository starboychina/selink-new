// Update comment
// ---------------------------------------------
// Update comment, and return it
// ---------------------------------------------
// 1. find post with its Id
// 2. update comment in the post's comments list
// 3. return the comment to client

var async = require('async'),
    Post = require('mongoose').model('Post');

var populateField = {
    '_owner': 'type firstName lastName title cover photo',
    'replyTo': 'type firstName lastName title cover photo'
};

module.exports = function(req, res, next) {

    // TODO: check ownership

    async.waterfall([

        // find the post
        function findPost(callback) {
            Post.findById(req.params.post, callback);
        },

        // remove the comment
        function removeComment(post, callback) {

            // comment was deleted in this way because I can't find a way to filter the deleted comment when the post are queried,
            // I tried $elemMatch, but it just return the first non-delete comment, not working here.

            // push the removed comment to the backup array
            post.removedComments.push(post.comments.id(req.params.comment));
            // pull the removed comment out from comment array
            post.comments.pull(req.params.comment);

            post.save(function(err, post) {
                if (err) callback(err);
                else callback(null, post.comments.id(req.params.comment));
            });
        }

    ], function(err, comment) {

        if (err) next(err);
        // return the created comment
        else res.json(comment);
    });
};
