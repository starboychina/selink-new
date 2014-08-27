// Bookmark post
// ---------------------------------------------
// Bookmark or unbookmark a post, and return the updated post
// ---------------------------------------------
// 1. find post with its Id
// 2. update the "bookmark" (and "bookmarked") field of the post
// 3. create activity for the people who bookmark the post (except owner himself)
// 4. create notification for the post owner when someone bookmark this post as first time
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

        // update bookmark of the post
        function updateBookmark(post, callback) {

            // wether this is the first time this user bookmark this post
            var isFirstTime = true,
                type = 'post-bookmarked';

            // if the user exists in the "bookmarked" field
            if (post.bookmarked.indexOf(req.user.id) >= 0)
                // it's not the first time he/she bookmark it
                isFirstTime = false;
            else
                // it is the first time, save the user's id in "bookmarked" field
                post.bookmarked.push(req.user.id);

            // if the user already bookmarked this post
            if (post.bookmark.indexOf(req.user.id) >= 0) {
                // unbookmark it
                post.bookmark.pull(req.user.id);
                type = 'post-unbookmarked';
            }
            else
                // bookmark it
                post.bookmark.push(req.user.id);

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

                    // only in the firstTime other people bookmark this post
                    if (type === 'post-bookmarked' && isFirstTime && post._owner != req.user.id)
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
                sio.sockets.in(post._owner._id).emit('post-bookmarked', {
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
                    type: 'post-bookmarked',
                    createDate: new Date()
                });

                // send email
                User.findOne()
                    .select('email')
                    .where('_id').equals(post._owner._id)
                    .where('mailSetting.postBookmarked').equals(true)
                    .where('logicDelete').equals(false)
                    .exec(function(err, recipient) {

                        if (err) callback(err);
                        // send new-post mail
                        else if (recipient) Mailer.postBookmarked(recipient, req.user, post);
                    });
            }

            // the last result is the updated post
            callback(null, post);
        }

    ], function(err, post) {

        if (err) next(err);
        // return the created post
        else res.json(post);
    });
};