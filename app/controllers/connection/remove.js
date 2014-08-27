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
var async = require('async'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Activity = mongoose.model('Activity'),
    Notification = mongoose.model('Notification');

module.exports = function(req, res, next) {

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