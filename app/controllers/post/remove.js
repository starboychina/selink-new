// Remove post
// ---------------------------------------------
// Remove a post, and return the updated post
// ---------------------------------------------
// 1. find post with its Id
// 2. update the "logicDelete" field of the post
// 3. delete the pointer of the post from owner profile
// 4. delete the pointer of the post from group profile
// 5. delete the post in solr
// 6. return the deleted post to client

var async = require('async'),
    mongoose = require('mongoose'),
    Post = mongoose.model('Post'),
    Group = mongoose.model('Group'),
    Mailer = require('../../mailer/mailer.js');

var populateField = {
    '_owner': 'type firstName lastName title cover photo',
    'comments._owner': 'type firstName lastName title cover photo',
    'group': 'name cover description'
};

module.exports = function(req, res, next) {

    // TODO: check post's ownership
    // TODO: if this post was removed, what to do with the activites
    // and notifications relate on it? and comments, bookmarks?

    async.waterfall([

        // find the post and mark it as logical deleted
        function findAndUpdatePost(callback) {

            Post.findByIdAndUpdate(req.params.post, {logicDelete: true}, callback);
        },

        function deleteRelateInfo(post, callback) {

            async.parallel({

                // remove the post id from user profile
                updateUser: function(callback) {
                    req.user.posts.pull(post.id);
                    req.user.save(callback);
                },

                // remove the post id from group profile
                updateGroup: function(callback) {

                    if (post.group)
                        // remove it from group profile
                        Group.findByIdAndUpdate(post.group, {$pull: {posts: post._id}}, callback);
                    else
                        callback(null);
                },

                // remove this post in solr
                updateSolr: function(callback) {

                    solr.delete('id', post.id, function(err, solrResult) {
                        if (err) callback(err);
                        else solr.commit(callback);
                    });
                }

            }, function(err, results) {

                if (err) callback(err);
                else callback(null, post);
            });
        }

    ], function(err, post) {

        if (err) next(err);
        // return the updated post
        else res.json(post);
    });
};