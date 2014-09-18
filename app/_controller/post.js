var _ = require('underscore'),
    _s = require('underscore.string'),
    fs = require('fs'),
    util = require('util'),
    // temp = require('temp'),
    path = require('path'),
    async = require('async'),
    moment = require('moment'),
    mongoose = require('mongoose'),
    Mailer = require('../mailer/mailer.js'),
    Post = mongoose.model('Post'),
    User = mongoose.model('User'),
    Group = mongoose.model('Group'),
    Activity = mongoose.model('Activity'),
    Notification = mongoose.model('Notification');

var populateField = {
    '_owner': 'type firstName lastName title cover photo',
    'comments._owner': 'type firstName lastName title cover photo',
    'group': 'name cover description'
};

// Post index
// ---------------------------------------------
// Return latest 20 posts of current user in descending order of create date.
// In the case of get other user's posts list, user id must passed by the route: '/users/:user/posts'
// In the case of get some group's posts list, group id must passed by the route: '/groups/:group/posts'
// ---------------------------------------------
// Parameter:
//   1. user  : The user's id of posts list belong to, passed by url   default: current uer
//   2. group : The group's id of posts list belong to, passed by url  default: none
//   3. before: A Unix time stamp used as start point of retrive       default: none
//   4. size  : Number of result to return                             default: 20
// ---------------------------------------------

exports.index = function(req, res, next) {

    // TODO: check parameters

    // if the request was get some specific user's posts list
    // we need to find the user from users collection first

    // if specified someone else
    if (req.params.user && req.params.user !== req.user.id) {

        // get the user's posts info (post ids)
        User.findById(req.params.user, 'posts', function(err, uesr) {
            // pass the user to internal method
            if (err) next(err);
            else _post_index(req, res, uesr, null, next);
        });

    // if specified some group
    } else if (req.params.group) {

        // get the group's posts info (post ids)
        Group.findById(req.params.group, 'posts', function(err, group) {
            // pass the group to internal method
            if (err) next(err);
            else _post_index(req, res, null, group, next);
        });

    } else {

        // default to current user
        _post_index(req, res, req.user, null, next);
    }
};

// internal method for index
_post_index = function(req, res, user, group, next) {

    // create query
    var query = Post.find();

    // if request specified user, populate the group.
    // cause the client should have the _owner, so we don't populate _owner
    if (user)
        query.where('_id').in(user.posts)
            .populate('group', populateField['group']);

    // if request specified group, populate the _owner
    // cause the client should have the group, so we don't populate group
    if (group)
        query.where('_id').in(group.posts)
            .populate('_owner', populateField['_owner']);

    // if request items before some time point
    if (req.query.before)
        query.where('createDate').lt(moment.unix(req.query.before).toDate());

    // default query parameter below
    query.select('-removedComments -logicDelete')
        .populate('comments._owner', populateField['comments._owner'])
        .where('logicDelete').equals(false)
        .limit(req.query.size || 20)
        .sort('-createDate')
        .exec(function(err, posts) {
            if (err) next(err);
            else if (posts.length === 0) res.json(404, {});
            else res.json(posts);
        });
};

// NewsFeed
// ---------------------------------------------
// Return the latest 20 posts of current user's friends and groups, in descending order of create date.
// ---------------------------------------------
// Parameter:
//   1. before: A Unix time stamp used as start point of retrive     default: none
//   2. size  : record number of query                               default: 20
// ---------------------------------------------

exports.newsfeed = function(req, res, next) {

    // create query
    var query = Post.find();

    // query posts belong to current user and his/her friends and groups
    query.or([
        {_owner: req.user.id},
        {_owner: {$in: req.user.friends}},
        {group: {$in: req.user.groups}}
    ]);

    // if request items before some time point
    if (req.query.before)
        query.where('createDate').lt(moment.unix(req.query.before).toDate());

    query.select('-removedComments -logicDelete')
        .populate('_owner', populateField['_owner'])
        .populate('group', populateField['group'])
        .populate('comments._owner', populateField['comments._owner'])
        .where('logicDelete').equals(false)
        .limit(req.query.size || 20)
        .sort('-createDate')
        .exec(function(err, posts) {
            if (err) next(err);
            else if (posts.length === 0) res.json(404, {});
            else res.json(posts);
        });
};

// Show single post
exports.show = function(req, res, next) {

    Post.findById(req.params.post)
        .where('logicDelete').equals(false)
        .populate('_owner', 'type firstName lastName title cover photo createDate')
        .populate('group', 'name cover description')
        .populate('comments._owner', 'type firstName lastName title cover photo createDate')
        .exec(function(err, post) {
            if (err) next(err);
            else res.json(post);
        });
};

// Create post
// ---------------------------------------------
// Create new post, and return the newly created post
// ---------------------------------------------
// 1. create post with content and group
//   2. save the post pointer in author profile
//   3. save the post pointer in group profile
//   4. create author activity
//   5. create notification for author's friends
//     6. send real-time notification to author's friends
//   7. send email notification to author's friends
//   8. create notification for group's participants
//     9. sent real-time notification to group's participants
//   10. send email notification to group's participants
//   11. commit post to solr
//   12. return the new post to client

exports.create = function(req, res, next) {

    async.waterfall([

        // // before save the post, extract the inlined base64 picture
        // function preProcess(callback) {

        //     var capture = /"data:image\/(.*?);base64,(.+?)"/g;
        //         data = capture.exec(req.body.content);

        //     while(data) {

        //         var tempName = temp.path({suffix: '.' + data[1]});

        //         console.log(tempName);

        //         fs.writeFile(tempName, data[2], 'base64');
        //     }

        //     callback(null, req.body.content);
        // },

        // create post
        function createPost(callback) {

            Post.create({
                _owner: req.user.id,
                group: req.body.group,
                content: req.body.content
            }, callback);
        },

        // create relate information
        function createRelateInfo(post, callback) {

            async.parallel({

                // save the post id in user profile
                updateUser: function(callback) {
                    req.user.posts.addToSet(post.id);
                    req.user.save(callback);
                },

                // save the post id in group profile
                updateGroup: function(callback) {

                    if (req.body.group)
                        // save the post id in group profile
                        Group.findByIdAndUpdate(req.body.group, {$addToSet: {posts: post.id}}, callback);
                    else
                        callback(null);
                },

                // create activity
                createActivity: function(callback) {

                    Activity.create({
                        _owner: req.user.id,
                        type: 'post-new',
                        targetPost: post.id,
                        targetGroup: req.body.group
                    }, callback);
                },

                // send notificaton to all friends
                createNotification: function(callback) {

                    if (req.user.friends && req.user.friends.length)
                        Notification.create({
                            _owner: req.user.friends,
                            _from: req.user.id,
                            type: 'post-new',
                            targetPost: post.id,
                            targetGroup: req.body.group
                        }, callback);
                    else
                        callback(null);
                },

                // index this post in solr
                createSolr: function(callback) {

                    solr.add(post.toSolr(), function(err, result) {
                        if (err) callback(err);
                        else solr.commit(callback);
                    });
                }

            }, function(err, results) {

                if (err) callback(err);
                else callback(null, post, results.updateGroup, results.createNotification);
            });
        },

        function sendMessages(post, group, notification, callback) {

            var postObj = post.toObject(), // this object is the full representation of post, only used for return
                notifiedUser = req.user.friends,
                owner = {
                    _id: req.user.id,
                    type: req.user.type,
                    firstName: req.user.firstName,
                    lastName: req.user.lastName,
                    title: req.user.title,
                    cover: req.user.cover,
                    photo: req.user.photo
                };

            // manually populate post owner
            postObj._owner = owner;

            // if the post belong to some group
            if (group) {
                // manually populate post group (as needed)
                postObj.group = {
                    _id: group.id,
                    name: group.name,
                    cover: group.cover,
                    description: group.description
                };

                // --------- this is NOT working :---------------
                // notifiedUser = _.union(req.user.friends, _.without(group.participants, req.user.id));
                // ----------------- Because :-------------------
                // intersection uses simple reference equality to compare the elements, rather than comparing their contents.
                // To compare two ObjectIds for equality you need to use the ObjectId.equals method.
                // So the simplest solution would be to convert the arrays to strings so that intersection will work.
                // ----------------------------------------------

                // change the notification receiver to group members + friends
                group.participants.forEach(function(participant) {
                    // note that I use user's '_id', cause the participant is an ObjectId (object).
                    // remember that the 'id' is the string representation of '_id'
                    if (!_.isEqual(participant, req.user._id))
                        notifiedUser.addToSet(participant);
                });
            }

            // send real time message to friends
            notifiedUser.forEach(function(room) {
                sio.sockets.in(room).emit('post-new', {
                    _id: notification.id,
                    _from: owner,
                    type: 'post-new',
                    targetPost: post,
                    targetGroup: group,
                    createDate: new Date()
                });
            });

            // send email to all friends
            User.find()
                .select('email')
                .where('_id').in(notifiedUser)
                .where('mailSetting.newPost').equals(true)
                .where('logicDelete').equals(false)
                .exec(function(err, recipients) {

                    if (err) callback(err);
                    // send new-post mail
                    else if (recipients) Mailer.newPost(recipients, req.user, post, group);
                });

            // the last result is the created post
            callback(null, postObj);
        }

    ], function(err, post) {

        if (err) next(err);
        // return the created post
        else res.json(post);
    });

};

// Update post
// ---------------------------------------------
// Update a post, and return the updated post
// ---------------------------------------------
// 1. find post with its Id
// 2. update the post
// 3. update the post in solr
// 4. return the full representation of the post to client

exports.update = function(req, res, next){

    // TODO: check post's ownership

    async.waterfall([

        // find the post and update it
        function updatePost(callback) {

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

exports.remove = function(req, res, next) {

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

exports.like = function(req, res, next){

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

exports.bookmark = function(req, res, next){

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