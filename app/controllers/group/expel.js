// Expel members from group
// ---------------------------------------------
// Update the 'participants' field of a group, and return the updated group
// ---------------------------------------------
// 1. find group with its Id
// 2. update the group
// 3. update the expeded member
// 4. create activity for current user
// 5. create notification for expeled people
// 6. send real time message to expeled people
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

                // update the 'participants' field
                updateGroup: function(callback) {

                    req.body.expeled.forEach(function(userId) {
                        group.participants.pull(userId);
                        group.announcelist.pull(userId);
                        group.stickylist.pull(userId);
                    });

                    group.save(callback);
                },

                // remove the group from expeled member's group list
                updateUser: function(callback) {

                    User.update({_id: {$in: req.body.expeled}}, {$pull: {groups: group.id}}, callback);
                },

                // create activity
                createActivity: function(callback) {

                    Activity.create({
                        _owner: req.user.id,
                        type: 'group-expeled',
                        targetGroup: group.id,
                        targetUser: req.body.expeled
                    }, callback);
                },

                // create notification
                createNotification: function(callback) {

                    Notification.create({
                        _owner: req.body.expeled,
                        _from: req.user.id,
                        type: 'group-expeled',
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

            // send real time message to all expeled people
            req.body.expeled.forEach(function(room) {
                sio.sockets.in(room).emit('group-expeled', {
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
                    type: 'group-expeled',
                    targetGroup: group,
                    createDate: new Date()
                });
            });

            // // send email to all expeled people ?? should we ??
            // User.find()
            //     .select('email')
            //     .where('_id').in(req.body.expeled)
            //     .where('mailSetting.groupInvitation').equals(true)
            //     .where('logicDelete').equals(false)
            //     .exec(function(err, users) {
            //         if (err) callback(err);
            //         else if (users) Mailer.groupInvitation(users, req.user, group);
            //     });

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