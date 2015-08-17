// Create comment
// ---------------------------------------------
// Create new comment, and return it
// ---------------------------------------------
// 1. find post with its Id
// 2. create comment in the post's comments list
// 3. create user activity
// 4. create notification for post owner (and replied user as needed)
// 5. send real-time notification to post owner and replied user
// 6. send email notification to post author and replied user
// 7. return the full representation of the comment to client

var async = require('async'),
    mongoose = require('mongoose'),
    Post = mongoose.model('Post'),
    User = mongoose.model('User'),
    Activity = mongoose.model('Activity'),
    Notification = mongoose.model('Notification'),
    Mailer = require('../../mailer/mailer.js'),
    Push = require('../../utils/push');

var populateField = {
    '_owner': 'type firstName lastName title cover photo',
    'replyTo': 'type firstName lastName title cover photo'
};

module.exports = function(req, res, next) {

    // TODO: check post's forbidden flag, check ownership

    async.waterfall([

        // find the post
        function findPost(callback) {
            Post.findById(req.params.post, callback);
        },

        // create comment
        function createComment(post, callback) {

            var replyTo = null,
                comment = post.comments.create({
                    _owner: req.user.id,
                    content: req.body.content
                });

            // if this comment is a reply to other comment
            if (req.body.replyTo) {
                // add the replied comment to this comment
                comment.replyTo = req.body.replyTo;
                // find out and hold the replied comment
                replyTo = post.comments.id(req.body.replyTo);
            }

            // add comment to post
            post.comments.push(comment);

            // save the post
            post.save(function(err, post) {
                if (err) callback(err);
                else callback(null, post, comment, replyTo);
            });
        },

        // create relate information
        function createRelateInfo(post, comment, replyTo, callback) {

            async.parallel({

                // create activity
                createActivity: function(callback) {

                    if (req.body.replyTo)
                        Activity.create({
                            _owner: req.user.id,
                            type: 'comment-replied',
                            targetPost: post.id,
                            targetComment: comment.id,
                            targetReplyTo: replyTo.id
                        }, callback);
                    else
                        Activity.create({
                            _owner: req.user.id,
                            type: 'post-commented',
                            targetPost: post.id,
                            targetComment: comment.id
                        }, callback);
                },

                // create notification for post owner
                commentNotification: function(callback) {

                    // if the comment is not a reply and the comment owner is not the post owner
                    // or if the comment is a reply and not reply the post owner
                    if ((!replyTo && post._owner != req.user.id)
                        || (replyTo && !post._owner.equals(replyTo._owner)))
                        Notification.create({
                            _owner: post._owner,
                            _from: req.user.id,
                            type: 'post-commented',
                            targetPost: post.id,
                            targetComment: comment.id
                        }, callback);
                    else
                        callback(null);
                },

                // create notification for replied user
                replyNotification: function(callback) {

                    // if the comment is a reply
                    if (replyTo)
                        Notification.create({
                            _owner: replyTo._owner,
                            _from: req.user.id,
                            type: 'comment-replied',
                            targetPost: post.id,
                            targetComment: comment.id,
                            targetReplyTo: replyTo.id
                        }, callback);
                    else
                        callback(null);
                }

            }, function(err, results) {

                if (err) callback(err);
                else callback(null, post, comment, replyTo, results.commentNotification, results.replyNotification);
            });
        },

        // send messages
        function sendMessages(post, comment, replyTo, commentNotification, replyNotification, callback) {

            var commentObj = comment.toObject(),
                commentOwner = {
                    _id: req.user.id,
                    type: req.user.type,
                    firstName: req.user.firstName,
                    lastName: req.user.lastName,
                    nickName: req.user.nickName,
                    title: req.user.title,
                    cover: req.user.cover,
                    photo: req.user.photo,
                    photo_ref: req.user.photo_ref
                };

            commentObj._owner = commentOwner;

            // send message about comment
            if (commentNotification) {

                var alertMessage = req.user.nickName + ' 评论了您的帖子.';
                var payload = {
                  type: 'post-commented',
                  id: post.id
                };

                Push(req.user.id, commentNotification._owner, payload, alertMessage, function(user){
                    // send real time message
                    sio.sockets.in(commentNotification._owner).emit('post-commented', {
                        _id: commentNotification.id,
                        _from: commentOwner,
                        type: 'post-commented',
                        targetPost: post,
                        targetComment: comment.id,
                        createDate: new Date()
                    });
                });

                // send email
                User.findOne()
                    .select('email')
                    .where('_id').equals(commentNotification._owner)
                    .where('mailSetting.postCommented').equals(true)
                    .where('logicDelete').equals(false)
                    .exec(function(err, recipient) {

                        if (err) callback(err);
                        else if (recipient) Mailer.postCommented(recipient, req.user, comment, post);
                    });
            }

            // send message about reply
            if (replyNotification) {

                var alertMessage = req.user.nickName + ' 回复了您的评论.';

                Push(req.user.id, replyNotification._owner, alertMessage, function(user){
                    // send real time message
                    sio.sockets.in(replyNotification._owner).emit('comment-replied', {
                        _id: replyNotification.id,
                        _from: commentOwner,
                        type: 'comment-replied',
                        targetPost: post,
                        targetComment: comment.id,
                        targetReplyTo: replyTo.id,
                        createDate: new Date()
                    });
                });

                // send email
                User.findOne()
                    .select('email')
                    .where('_id').equals(replyNotification._owner)
                    .where('mailSetting.commentReplied').equals(true)
                    .where('logicDelete').equals(false)
                    .exec(function(err, recipient) {

                        if (err) callback(err);
                        else if (recipient) Mailer.commentReplied(recipient, req.user, comment, replyTo, post);
                    });
            }

            callback(null, commentObj);
        }

    ], function(err, comment) {

        if (err) next(err);
        // return the created comment
        else res.json(comment);
    });

};
