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

var async = require('async'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Activity = mongoose.model('Activity'),
    Notification = mongoose.model('Notification'),
    Mailer = require('../../mailer/mailer.js'),
    Push = require('../../utils/push');

module.exports = function(req, res, next) {

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
                    var alertMessage = req.user.firstName + " " + req.user.lastName + " 请求成为您的好友";
                    Push(req.user.id,req.body.id,alertMessage,function(user){
                        // send real time message to target user
                        sio.sockets.in(req.body.id).emit('friend-invited', {
                            _id: notification._id,
                            _from: {
                                _id: req.user.id,
                                nickName: req.user.nickName,
                                photo: req.user.photo_ref
                            },
                            type: 'friend-invited',
                            createDate: new Date()
                        });
                    })

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
