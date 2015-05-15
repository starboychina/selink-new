// Join group
// ---------------------------------------------
// Update the 'participants' (and 'invited' as needed) field of a group, and return the updated group
// ---------------------------------------------
// 1. find group with its Id
// 2. update the user
// 3. update the group
// 4. create activity for current user
// 5. create notification for group owner
// 6. send real time message to group owner
// 7. send email to group owner
// 8. return the group to client

var async = require('async'),
    mongoose = require('mongoose'),
    Group = mongoose.model('Group'),
    User = mongoose.model('User'),
    Activity = mongoose.model('Activity'),
    Notification = mongoose.model('Notification'),
    modelExpand = require('../../utils/modelExpand'),
    Mailer = require('../../mailer/mailer.js');

module.exports = function(req, res, next) {

    async.waterfall([

        // find group
        function findGroup(callback) {

            Group.findById(req.params.group, callback);
        },

        // join the group
        function joinGroup(group, callback) {

            async.parallel({

                // save the group id in user profile
                updateUser: function(callback) {

                    req.user.groups.addToSet(group.id);
                    req.user.save(callback);
                },

                // save the user id in group profile
                updateGroup: function(callback) {

                    // remove user's id from group's invited list, in case he had been invited
                    group.invited.pull(req.user._id);
                    if (group.participants.length == 0){
                        group._owner = req.user.id;
                        group.logicDelete = false;
                    }
                    // add user id to group participants
                    group.participants.addToSet(req.user.id);
                    group.announcelist.addToSet(req.user.id);
                    // update group
                    group.save(callback);
                },

                // log user's activity
                createActivity: function(callback) {

                    Activity.create({
                        _owner: req.user.id,
                        type: 'group-joined',
                        targetGroup: group.id
                    }, callback);
                },

                // create notification for group owner
                createNotification: function(callback) {

                    Notification.create({
                        _owner: group._owner,
                        _from: req.user.id,
                        type: 'group-joined',
                        targetGroup: group.id
                    }, callback);
                }

            }, function(err, results) {

                if (err) callback(err);
                else callback(null, group, results.createNotification);
            });
        },

        // send messages
        function sendMessages(group, notification, callback) {

            // send real time message to group owner
            sio.sockets.in(group._owner).emit('group-joined', {
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
                type: 'group-joined',
                targetGroup: group,
                createDate: new Date()
            });

            // send email to group owner
            User.findById(group._owner)
                .select('email')
                .where('mailSetting.groupJoined').equals(true)
                .where('logicDelete').equals(false)
                .exec(function(err, recipient) {
                    if (err) callback(err);
                    else if (recipient) Mailer.groupJoined(recipient, req.user, group);
                });

            callback(null, group);
        }

    ], function(err, group) {

        if (err) next(err);
        // return the updated group
        else {
            group = modelExpand.group(group,req.user);
            res.json(group);
        }
    });
};