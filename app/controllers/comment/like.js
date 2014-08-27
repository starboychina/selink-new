// Like comment
// ---------------------------------------------
// Like or unlike a comment, and return it
// ---------------------------------------------
// 1. find the post with its Id
// 2. find the comment with its Id in post's comments list
// 3. update the "like" (and "liked") field of the comment
// 4. create activity for the people who like the comment (except owner himself)
// 5. create notification for the comment owner when someone like this comment as first time
// 6. send real-time notification to comment owner
// 7. send email notification to comment owner
// 8. return the full representation of the comment to client

var async = require('async'),
    mongoose = require('mongoose'),
    Post = mongoose.model('Post'),
    User = mongoose.model('User'),
    Activity = mongoose.model('Activity'),
    Notification = mongoose.model('Notification'),
    Mailer = require('../../mailer/mailer.js');

var populateField = {
    '_owner': 'type firstName lastName title cover photo',
    'replyTo': 'type firstName lastName title cover photo'
};

module.exports = function(req, res, next){

    async.waterfall([

        // find the post
        function findPost(callback) {
            Post.findById(req.params.post, callback);
        },

        // update the like of comment
        function updateLike(post, callback) {

            // wether this is the first time this user like this comment
            var comment = post.comments.id(req.params.comment),
                isFirstTime = true,
                type = 'comment-liked';

            // if the user exists in the "liked" field
            if (comment.liked.indexOf(req.user.id) >= 0)
                // it's not the first time he/she like it
                isFirstTime = false;
            else
                // it is the first time, save the user's id in "liked" field
                comment.liked.push(req.user.id);

            // if the user already liked this comment
            if (comment.like.indexOf(req.user.id) >= 0) {
                // unlike it
                comment.like.pull(req.user.id);
                type = 'comment-unliked';
            }
            else
                // like it
                comment.like.push(req.user.id);

            // update the post (comment)
            post.save(function(err, post) {
                if (err) callback(err);
                else callback(null, post, comment, type, isFirstTime);
            });
        },

        // create related information
        function createRelateInfo(post, comment, type, isFirstTime, callback) {

            async.parallel({

                // create activity
                createActivity: function(callback) {

                    // only for the people other than comment owner
                    if (comment._owner != req.user.id)
                        Activity.create({
                            _owner: req.user.id,
                            type: type,
                            targetPost: req.params.post,
                            targetComment: req.params.comment
                        }, callback);
                    else
                        callback(null);
                },

                // create notification for comment owner
                createNotification: function(callback) {

                    // only in the firstTime other people like this comment
                    if (type === 'comment-liked' && isFirstTime && comment._owner != req.user.id)
                        Notification.create({
                            _owner: comment._owner,
                            _from: req.user.id,
                            type: type,
                            targetPost: req.params.post,
                            targetComment: req.params.comment
                        }, callback);
                    else
                        callback(null);
                }

            }, function(err, results) {

                if (err) callback(err);
                else callback(null, post, comment, results.createNotification);
            });
        },

        // populate embeded info of comment for later use (and return)
        function populateComment(post, comment, notification, callback) {

            var setting = [{
                    path:'_owner',
                    select: populateField['_owner']
                },{
                    path:'replyTo',
                    select: populateField['replyTo']
                }];

            // get the full representation of the comment
            User.populate(comment, setting, function(err, comment) {

                if (err) callback(err);
                else callback(null, post, comment, notification);
            });
        },

        // send messages
        function sendMessages(post, comment, notification, callback) {

            if (notification) {

                // send real time message
                sio.sockets.in(comment._owner._id).emit('comment-liked', {
                    _id: notification.id,
                    _from: {
                        _id: req.user.id,
                        type: req.user.type,
                        firstName: req.user.firstName,
                        lastName: req.user.lastName,
                        title: req.user.title,
                        cover: req.user.cover,
                        photo: req.user.photo
                    },
                    type: 'comment-liked',
                    targetPost: post,
                    targetComment: req.params.comment,
                    createDate: new Date()
                });

                // send email
                User.findOne()
                    .select('email')
                    .where('_id').equals(comment._owner._id)
                    .where('mailSetting.commentLiked').equals(true)
                    .where('logicDelete').equals(false)
                    .exec(function(err, recipient) {

                        if (err) callback(err);
                        else if (recipient) Mailer.commentLiked(recipient, req.user, comment, post);
                    });
            }

            callback(null, comment);
        }

    ], function(err, comment) {

        if (err) next(err);
        // return the liked comment
        else res.json(comment);
    });

};