// Invite people join group
// ---------------------------------------------
// Update the 'invited' field of a group, and return the updated group
// ---------------------------------------------
// 1. find group with its Id
// 2. update the group
// 3. create activity for current user
// 4. create notification for invited people
// 5. send real time message to invited people
// 6. send email to invited people
// 7. return the group to client

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

        // find the group
        function findGroup(callback) {
            Group.findById(req.params.group, callback);
        },

        // create relate information
        function createRelateInfo(group, callback) {

            async.parallel({

                // update the 'invited' field
                updateGroup: function(callback) {

                    req.body.invited.forEach(function(userId) {
                        group.invited.addToSet(userId);
                    });

                    group.save(callback);
                },

                // create activity
                createActivity: function(callback) {

                    Activity.create({
                        _owner: req.user.id,
                        type: 'group-invited',
                        targetGroup: group.id,
                        targetUser: req.body.invited
                    }, callback);
                },

                // create notification
                createNotification: function(callback) {

                    Notification.create({
                        _owner: req.body.invited,
                        _from: req.user.id,
                        type: 'group-invited',
                        targetGroup: group.id
                    }, callback);
                }

            }, function(err, results) {

                if (err) callback(err);
                else callback(null, results.updateGroup[0], results.createNotification);
            });

        },

        // send messages
        function sendMessages(group, notification, callback) {

            // send real time message to all invited people
            req.body.invited.forEach(function(room) {
                sio.sockets.in(room).emit('group-invited', {
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
                    type: 'group-invited',
                    targetGroup: group,
                    createDate: new Date()
                });
            });

            // send email to all invited people
            User.find()
                .select('email')
                .where('_id').in(req.body.invited)
                .where('mailSetting.groupInvitation').equals(true)
                .where('logicDelete').equals(false)
                .exec(function(err, users) {
                    if (err) callback(err);
                    else if (users) Mailer.groupInvitation(users, req.user, group);
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