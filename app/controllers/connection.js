var _s = require('underscore.string'),
    async = require('async'),
    moment = require('moment'),
    mongoose = require('mongoose'),
    Mailer = require('../mailer/mailer.js'),
    User = mongoose.model('User'),
    Activity = mongoose.model('Activity'),
    Notification = mongoose.model('Notification');

var populateField = {};

// Connection list
// ---------------------------------------------
// Return a list of 20 people that have specific connection with user in descending order of create date.
// In the case of get some user's connections, user id must passed by the route: '/users/:user/connection'
// ---------------------------------------------
// Parameter:
//   1. user  : The user's id of posts list blong to, passed by url                          default: current user
//   2. type  : The type of connection, identified by the path of request                    default: friends
//              a. friends    -- the people are user's friends
//              b. invited    -- the people that user had invited as friend
//              c. nonfriends -- the people are not user's friends (include invited)
//              d. discover   -- the people that user completely unknow (exclude invited)
//   3. before: A Unix time stamp used as start point of retrive                             default: none
//   4. size  : Number of result to return                                                   default: 20
// ---------------------------------------------

exports.index = function(req, res, next) {

    // TODO: check parameters

    // if the request was get some specific user's connections
    // we need to get the user from users collection

    // if specified someone not current user
    if (req.params.user && req.params.user !== req.user.id) {

        // get the user's connections (user ids)
        User.findById(req.params.user, 'friends invited', function(err, uesr) {
            // pass the user to internal method
            if (err) next(err);
            else _connection_index(req, res, uesr, next);
        });

    } else {

        // no specified user, pass current user to internal method
        _connection_index(req, res, req.user, next);
    }

};

// internal method for index
_connection_index = function(req, res, user, next) {

    // create query
    var query = User.find();

    // if request "invited" connection type
    if (_s.endsWith(req.path, "/invited"))
        query.where('_id').in(user.invited);

    // if request "nonfriends" connection type
    else if (_s.endsWith(req.path, "/nonfriends"))
        query.where('_id').ne(user._id).nin(user.friends);

    // if request "discover" connection type
    else if (_s.endsWith(req.path, "/discover"))
        query.where('_id').ne(user._id).nin(user.friends.concat(user.invited));

    // defaultly, find "friends"
    else
        query.where('_id').in(user.friends);

    // if request items before some time point
    if (req.query.before)
        query.where('createDate').lt(moment.unix(req.query.before).toDate());

    query.select('type firstName lastName title cover bio photo employments educations createDate')
        .where('logicDelete').equals(false)
        .limit(req.query.size || 20)
        .sort('-createDate')
        .exec(function(err, users) {
            if (err) next(err);
            else if (users.length === 0) res.json(404, {});
            else res.json(users);
        });

};

// Create Friend
// ---------------------------------------------
// Add a friend invitation for current user. This request will:
//   1. update the "invited" field for current user
//   2. create "friend-invited" activity for current user
//   3. create "friend-invited" notification for invited user
//   4. send real time message to invited user
//   5. send email to invited user
// ---------------------------------------------
// Parameter:
//   1. id  : The user's id that was invited
// ---------------------------------------------

exports.create = function(req, res, next) {

    // TODO: check friend id is already in the 'friend' or 'invited' list

    async.parallel({

        // add the friend's id into user's invited list
        updateUser: function (callback) {

            req.user.invited.addToSet(req.body.id);
            req.user.save(callback);
        },

        // create activity for current user
        createActivity: function (callback) {

            Activity.create({
                _owner: req.user.id,
                type: 'friend-invited',
                targetUser: req.body.id
            }, callback);
        },

        // create notification for target user
        createNotification: function (callback) {

            Notification.create({
                _owner: req.body.id,
                _from: req.user.id,
                type: 'friend-invited'
            }, function(err, notification) {

                if (err) callback(err);
                else {
                    // send real time message to target user
                    sio.sockets.in(req.body.id).emit('friend-invited', {
                        _id: notification._id,
                        _from: {
                            _id: req.user.id,
                            type: req.user.type,
                            firstName: req.user.firstName,
                            lastName: req.user.lastName,
                            title: req.user.title,
                            cover: req.user.cover,
                            photo: req.user.photo
                        },
                        type: 'friend-invited',
                        createDate: new Date()
                    });

                    callback(null);
                }
            });
        },

        // send Email to target user
        sendEmail: function (callback) {

            User.findOne()
                .select('email')
                .where('_id').equals(req.body.id)
                .where('mailSetting.friendInvitation').equals(true)
                .where('logicDelete').equals(false)
                .exec(function(err, recipient) {
                    if (err) callback(err);
                    else if (recipient) Mailer.friendInvitation(recipient, req.user);
                });

            callback(null);
        }

    }, function(err, results) {

        if (err) next(err);
        // return the updated user
        else res.json(results.updateUser[0]);
    });

};

// Remove Friend
// ---------------------------------------------
// Remove a friend from the friends list current user. This request will:
//   1. update the "friends" field for current user
//   2. update the "friends" field for target user
//   3. create "friend-break" activity for current user
//   4. create "friend-break" notification for target user
//   5. send real time message to target user
// ---------------------------------------------
// Parameter:
//   1. id  : The user's id that will removed
// ---------------------------------------------

exports.remove = function(req, res, next) {

    // TODO: check friend id is already in the 'friend' or 'invited' list

    async.parallel({

        // remove the friend's id from user's friend list
        updateUser: function(callback) {

            req.user.friends.pull(req.body.id);
            req.user.save(callback);
        },

        // find that friend, remove current user from his friend list
        updateFriend: function(callback) {

            User.findByIdAndUpdate(req.body.id, {'$pull': {friends: req.user.id}}, callback);
        },

        // create activity for current user
        createActivity: function(callback) {

            // log user's activity
            Activity.create({
                _owner: req.user.id,
                type: 'friend-break',
                targetUser: req.body.id
            }, callback);
        },

        // create notification for target user
        createNotification: function(callback) {

            Notification.create({
                _owner: req.body.id,
                _from: req.user.id,
                type: 'friend-break'
            }, function(err, notification) {

                if (err) callback(err);
                else {
                    // send real time message to target user
                    sio.sockets.in(req.body.id).emit('friend-break', {
                        _id: notification._id,
                        _from: {
                            _id: req.user.id,
                            type: req.user.type,
                            firstName: req.user.firstName,
                            lastName: req.user.lastName,
                            title: req.user.title,
                            cover: req.user.cover,
                            photo: req.user.photo
                        },
                        type: 'friend-break',
                        createDate: new Date()
                    });

                    callback(null);
                }
            });
        }

    }, function(err, results) {

        if (err) next(err);
        // return the updated user
        else res.json(results.updateUser[0]);
    });

};

exports.suggest = function(req, res, next) {

    var initial = req.query.initial;

    User.find({_id: {'$ne': req.user._id}})
        .or([{firstName: new RegExp(initial, "i")}, {lastName: new RegExp(initial, "i")}])
        .select('firstName lastName bio photo')
        .limit(8)
        .exec(function(err, users) {
            if (err) next(err);
            else
            // return the user
            res.json(users);
        });
};