// Like post
// ---------------------------------------------
// Like or unlike a post, and return the updated post
// ---------------------------------------------
// 1. find post with its Id
// 2. update the "like" (and "liked") field of the post
// 3. create activity for the people who like the post (except owner himself)
// 4. create notification for the post owner when someone like this post as first time
// 5. send real-time notification to post owner
// 6. send email notification to post owner
// 7. return the post to client

var async = require('async'),
    mongoose = require('mongoose'),
    Post = mongoose.model('Post'),
    User = mongoose.model('User'),
    Activity = mongoose.model('Activity'),
    Notification = mongoose.model('Notification'),
    Mailer = require('../../mailer/mailer.js');

var populateField = {
    '_owner': 'type firstName lastName title cover photo',
    'comments._owner': 'type firstName lastName title cover photo',
    'group': 'name cover description'
};

module.exports = function(req, res, next){

    async.waterfall([

        // find post
        function findPost(callback) {
            Post.findById(req.params.post, callback);
        },

        // update like of the post
        function updateLike(post, callback) {

            // wether this is the first time this user like this post
            var isFirstTime = true,
                type = 'post-liked';

            // if the user exists in the "liked" field
            if (post.liked.indexOf(req.user.id) >= 0)
                // it's not the first time he/she like it
                isFirstTime = false;
            else
                // it is the first time, save the user's id in "liked" field
                post.liked.push(req.user.id);

            // if the user already liked this post
            if (post.like.indexOf(req.user.id) >= 0) {
                // unlike it
                post.like.pull(req.user.id);
                type = 'post-unliked';
            }
            else
                // like it
                post.like.push(req.user.id);

            // update the post
            post.save(function(err, post) {
                if (err) callback(err);
                else callback(null, post, type, isFirstTime);
            });
        },

        // create related information
        function createRelateInfo(post, type, isFirstTime, callback) {

            async.parallel({

                // create activity
                createActivity: function(callback) {

                    // only for the people other than post owner
                    if (post._owner != req.user.id)
                        Activity.create({
                            _owner: req.user.id,
                            type: type,
                            targetPost: post.id
                        }, callback);
                    else
                        callback(null);
                },

                // create notification for post owner
                createNotification: function(callback) {

                    // only in the firstTime other people like this post
                    if (type === 'post-liked' && isFirstTime && post._owner != req.user.id)
                        Notification.create({
                            _owner: post._owner,
                            _from: req.user.id,
                            type: type,
                            targetPost: post.id
                        }, callback);
                    else
                        callback(null);
                }

            }, function(err, results) {

                if (err) callback(err);
                else callback(null, post, results.createNotification);
            });
        },

        // get the full representation of the post
        function populatePost(post, notification, callback) {

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
            post.populate(setting, function(err, post) {

                if (err) callback(err);
                else callback(null, post, notification);
            });
        },

        // send the messages
        function sendMessages(post, notification, callback) {

            if (notification) {

                // send real time message
                sio.sockets.in(post._owner._id).emit('post-liked', {
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
                    targetPost: post,
                    type: 'post-liked',
                    createDate: new Date()
                });

                // send email
                User.findOne()
                    .select('email')
                    .where('_id').equals(post._owner._id)
                    .where('mailSetting.postLiked').equals(true)
                    .where('logicDelete').equals(false)
                    .exec(function(err, recipient) {

                        if (err) callback(err);
                        // send new-post mail
                        else if (recipient) Mailer.postLiked(recipient, req.user, post);
                    });
            }

            // the last result is the updated post
            callback(null, post);
        }

    ], function(err, post) {

        if (err) next(err);
        // return the updated post
        else res.json(post);
    });
};