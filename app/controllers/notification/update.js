// Update Notification
var async = require('async'),
    mongoose = require('mongoose'),
    Mailer = require('../../mailer/mailer.js'),
    User = mongoose.model('User'),
    Group = mongoose.model('Group'),
    Activity = mongoose.model('Activity'),
    Notification = mongoose.model('Notification');

module.exports = function(req, res, next) {

    // get the notification
    Notification.findOne({
        _id: req.params.notification,
        _owner: req.user.id,  // ensure notification owner is current user
        confirmed: {'$ne': req.user.id}  // only the unconfirmed notification
    }, function(err, notification) {

        // if error exist
        if (err) next(err);

        // if notification not exist
        else if (!notification || !req.body.result) {
            res.json(404, {});
        }

        // approve friend invitation
        else if (req.body.result == "approved" && notification.type == 'friend-invited') {
            approve(req, res, next, notification);
        }

        // decline friend invitation
        else if (req.body.result == "declined" && notification.type == 'friend-invited') {
            decline(req, res, next, notification);
        }

        // approve group application
        else if (req.body.result == "approved" && notification.type == 'group-applied') {
            approveApplication(req, res, next, notification);
        }

        // decline group application
        else if (req.body.result == "declined" && notification.type == 'group-applied') {
            declineApplication(req, res, next, notification);
        }

        // accept group invitation
        else if (req.body.result == "accepted") {
            accept(req, res, next, notification);
        }

        // refuse group invitation
        else if (req.body.result == "refused") {
            refuse(req, res, next, notification);
        }

        // acknowledge a notification
        else if (req.body.result == "acknowledged") {
            acknowledge(req, res, next, notification);
        }
    });
};

// Approve friend invitation
// ---------------------------------------------
// Add a friend to the friends list of current user. This request will:
//   1. update the "invited" and "friends" field for current user
//   2. update the "invited" and "friends" field for target user
//   3. update the "result" field for notification as "approved"
//   4. create "friend-approved" activity for current user
//   5. create "friend-approved" notification for target user
//   6. send real time message to target user
//   7. send Email to target user
// ---------------------------------------------
// Parameter:
//   1. id  : The user's id that was approved
// ---------------------------------------------

approve = function(req, res, next, notification) {

    async.parallel({

        // add the friend's id into user's friends list
        updateUser: function(callback) {

            // remove the request sender's id from user's invited list
            // (in case they invited each other)
            req.user.invited.pull(notification._from);
            // add the request sender's id into user's friend list
            req.user.friends.addToSet(notification._from);

            req.user.save(callback);
        },

        // find that friend, add current user to his friend list
        updateFriend: function(callback) {

            User.findByIdAndUpdate(notification._from, {
                '$pull': {invited: req.user.id},
                '$push': {friends: req.user.id},
            }, callback);
        },

        // mark the notification as confirmed
        updateNotification: function(callback) {

            notification.result = req.body.result;
            notification.confirmed.addToSet(req.user.id);
            notification.save(callback);
        },

        // create activity for current user
        createActivity: function(callback) {

            Activity.create({
                _owner: req.user.id,
                type: 'friend-approved',
                targetUser: notification._from
            }, callback);
        },

        // create notification for target user
        createNotification: function(callback) {

            Notification.create({
                _owner: notification._from,
                _from: req.user.id,
                type: 'friend-approved'
            }, function(err, noty) {

                if (err) callback(err);
                else {

                    // send real time message to target user
                    sio.sockets.in(notification._from).emit('friend-approved', {
                        _id: noty._id,
                        _from: {
                            _id: req.user.id,
                            type: req.user.type,
                            firstName: req.user.firstName,
                            lastName: req.user.lastName,
                            title: req.user.title,
                            cover: req.user.cover,
                            photo: req.user.photo
                        },
                        type: 'friend-approved',
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
                .where('_id').equals(notification._from)
                .where('mailSetting.invitationAccpected').equals(true)
                .where('logicDelete').equals(false)
                .exec(function(err, recipient) {
                    if (err) callback(err);
                    else if (recipient) Mailer.friendApprove(recipient, req.user);
                });

            callback(null);
        }

    }, function(err, results) {

        if (err) next(err);
        // return the updated notification
        else res.json(results.updateNotification[0]);
    });

};

// Decline friend invitation
// ---------------------------------------------
// Remove a friend from the invited list of the user who create invitation. This request will:
//   1. update the "invited" field for target user
//   2. update the "result" field for notification as "declined"
//   3. create "friend-declined" activity for current user
//   4. create "friend-declined" notification for target user
//   5. send real time message to target user
// ---------------------------------------------
// Parameter:
//   1. id  : The user's id that was declined
// ---------------------------------------------

decline = function(req, res, next, notification) {

    async.parallel({

        // remove user's id from request sender's invited list
        updateUser: function(callback) {

            User.findByIdAndUpdate(notification._from, {
                '$pull': {invited: req.user.id}
            }, callback);
        },

        // mark the notification as confirmed
        updateNotification: function(callback) {

            notification.result = req.body.result;
            notification.confirmed.addToSet(req.user.id);
            notification.save(callback);
        },

        // create activity for current user
        createActivity: function(callback) {

            Activity.create({
                _owner: req.user.id,
                type: 'friend-declined',
                targetUser: notification._from
            }, callback);
        },

        // create notification for target user
        createNotification: function(callback) {

            Notification.create({
                _owner: notification._from,
                _from: req.user.id,
                type: 'friend-declined'
            }, function(err, noty) {

                if (err) callback(err);
                else {

                    // send real time message to target user
                    sio.sockets.in(notification._from).emit('friend-declined', {
                        _id: noty._id,
                        _from: {
                            _id: req.user.id,
                            type: req.user.type,
                            firstName: req.user.firstName,
                            lastName: req.user.lastName,
                            title: req.user.title,
                            cover: req.user.cover,
                            photo: req.user.photo
                        },
                        type: 'friend-declined',
                        createDate: new Date()
                    });

                    callback(null);
                }
            });
        }

    }, function(err, results) {

        if (err) next(err);
        // return the updated notification
        else res.json(results.updateNotification[0]);
    });

};

// Approve group application
// ---------------------------------------------
// Add the group applicant to the group member list
// ---------------------------------------------
// 1. update the "applying" and "groups" field for applicants
// 2. update the "applicants" and "participants" field for target group
// 3. update the "result" field for notification as "approved"
// 4. create "friend-approved" activity for current user
// 5. create "friend-approved" notification for applicants
// 6. send real time message to applicants
// 7. send Email to applicants

approveApplication = function(req, res, next, notification) {

    async.parallel({

        // update user
        updateUser: function(callback) {

            // remove the group's id from applicant's applying list
            // then add it into applicant's groups list
            User.findByIdAndUpdate(notification._from, {
                '$pull': {applying: notification.targetGroup},
                '$addToSet': {groups: notification.targetGroup},
            }, callback);
        },

        // update group
        updateGroup: function(callback) {

            // remove the applicant's from group's applicants list
            // then add it into group's participants list
            Group.findByIdAndUpdate(notification.targetGroup, {
                '$pull': {applicants: notification._from},
                '$addToSet': {participants: notification._from},
            }, callback)
        },

        // mark the notification as confirmed
        updateNotification: function(callback) {

            notification.result = req.body.result;
            notification.confirmed.addToSet(req.user.id);
            notification.save(callback);
        },

        // create activity for group owner
        createActivity: function(callback) {

            Activity.create({
                _owner: req.user.id,
                type: 'group-approved',
                targetUser: notification._from,
                targetGroup: notification.targetGroup
            }, callback);
        },

        // create notification for approved user
        createNotification: function(callback) {

            Notification.create({
                _owner: notification._from,
                _from: req.user.id,
                type: 'group-approved',
                targetGroup: notification.targetGroup
            }, callback);
        }

    }, function(err, results) {

        if (err) next(err);
        else {

            var group = results.updateGroup,
                newNotification = results.createNotification;

            // send real time message to approved user
            sio.sockets.in(notification._from).emit('group-approved', {
                _id: newNotification._id,
                _from: {
                    _id: req.user.id,
                    type: req.user.type,
                    firstName: req.user.firstName,
                    lastName: req.user.lastName,
                    title: req.user.title,
                    cover: req.user.cover,
                    photo: req.user.photo
                },
                type: 'group-approved',
                targetGroup: group,
                createDate: new Date()
            });

            // send email to approved user
            User.findById(notification._from)
                .select('email')
                .where('mailSetting.groupApproved').equals(true)
                .where('logicDelete').equals(false)
                .exec(function(err, recipient) {
                    if (err) callback(err);
                    else if (recipient) Mailer.groupApproved(recipient, req.user, group);
                });

            // return the updated notification
            res.json(results.updateNotification[0]);   
        }
    });
};

// Decline group application
// ---------------------------------------------
// Remove a friend from the invited list of the user who create invitation. This request will:
//   1. update the "invited" field for target user
//   2. update the "result" field for notification as "declined"
//   3. create "friend-declined" activity for current user
//   4. create "friend-declined" notification for target user
//   5. send real time message to target user
// ---------------------------------------------
// Parameter:
//   1. id  : The user's id that was declined
// ---------------------------------------------

declineApplication = function(req, res, next, notification) {

    async.parallel({

        // update user
        updateUser: function(callback) {

            // remove the group's id from applicant's applying list
            User.findByIdAndUpdate(notification._from, {
                '$pull': {applying: notification.targetGroup}
            }, callback);
        },

        // update group
        updateGroup: function(callback) {

            // remove the applicant's from group's applicants list
            Group.findByIdAndUpdate(notification.targetGroup, {
                '$pull': {applicants: notification._from}
            }, callback)
        },

        // mark the notification as confirmed
        updateNotification: function(callback) {

            notification.result = req.body.result;
            notification.confirmed.addToSet(req.user.id);
            notification.save(callback);
        },

        // create activity for group owner
        createActivity: function(callback) {

            Activity.create({
                _owner: req.user.id,
                type: 'group-declined',
                targetUser: notification._from,
                targetGroup: notification.targetGroup
            }, callback);
        },

        // create notification for declined user
        createNotification: function(callback) {

            Notification.create({
                _owner: notification._from,
                _from: req.user.id,
                type: 'group-declined',
                targetGroup: notification.targetGroup
            }, callback);
        }

    }, function(err, results) {

        if (err) next(err);
        else {

            var group = results.updateGroup,
                newNotification = results.createNotification;

            // send real time message to declined user
            sio.sockets.in(notification._from).emit('group-declined', {
                _id: newNotification._id,
                _from: {
                    _id: req.user.id,
                    type: req.user.type,
                    firstName: req.user.firstName,
                    lastName: req.user.lastName,
                    title: req.user.title,
                    cover: req.user.cover,
                    photo: req.user.photo
                },
                type: 'group-declined',
                targetGroup: group,
                createDate: new Date()
            });

            // // send email to declined user
            // Mailer.friendApprove({
            //     from: req.user,
            //     email: user.email
            // });

            // return the updated notification
            res.json(results.updateNotification[0]);   
        }
    });
};

accept = function(req, res, next, notification) {

    async.parallel({

        // save the group id in user profile
        updateUser: function(callback) {

            req.user.groups.addToSet(notification.targetGroup);
            req.user.save(callback);
        },

        // move user's id from group's invited list
        // to the participants list
        updateGroup: function(callback) {

            Group.findByIdAndUpdate(notification.targetGroup, {
                '$pull': {invited: req.user.id},
                '$addToSet': {participants: req.user.id},
            }, callback);
        },

        // mark the notification as confirmed
        updateNotification: function(callback) {
            
            notification.result = req.body.result;
            notification.confirmed.addToSet(req.user.id);
            notification.save(callback);
        },

        // log user's activity
        createActivity: function(callback) {

            Activity.create({
                _owner: req.user.id,
                type: 'group-joined',
                targetGroup: notification.targetGroup
            }, callback);
        },

        // create notification from group owner
        createNotification: function(callback) {

            Notification.create({
                _owner: notification._from,   // TODO: this should be the group owner!!!
                _from: req.user.id,
                type: 'group-joined',
                targetGroup: notification.targetGroup
            }, callback);
        }

    }, function(err, results) {

        if (err) next(err);
        else {

            var group = results.updateGroup,
                newNotification = results.createNotification;

            // send real time message
            sio.sockets.in(group._owner).emit('group-joined', {
                _id: newNotification._id,
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

            // return the updated notification
            res.json(results.updateNotification[0]);
        }
    });

};

refuse = function(req, res, next, notification) {

    async.parallel({

        // remove user's id from group's invited list
        updateGroup: function(callback) {

            Group.findByIdAndUpdate(notification.targetGroup, {
                '$pull': {invited: req.user.id}
            }, callback);
        },

        // mark the notification as confirmed
        updateNotification: function(callback) {

            notification.result = req.body.result;
            notification.confirmed.addToSet(req.user.id);
            notification.save(callback);
        },

        // log user's activity
        createActivity: function(callback) {

            Activity.create({
                _owner: req.user.id,
                type: 'group-refused',
                targetGroup: notification.targetGroup
            }, callback);
        },

        // create notification from group owner
        createNotification: function(callback) {

            Notification.create({
                _owner: notification._from,
                _from: req.user.id,
                type: 'group-refused',
                targetGroup: notification.targetGroup
            }, callback);
        }

    }, function(err, results) {

        if (err) next(err);
        else {

            var group = results.updateGroup,
                newNotification = results.createNotification;

            // send real time message
            sio.sockets.in(group._owner).emit('group-refused', {
                _id: newNotification._id,
                _from: {
                    _id: req.user.id,
                    type: req.user.type,
                    firstName: req.user.firstName,
                    lastName: req.user.lastName,
                    title: req.user.title,
                    cover: req.user.cover,
                    photo: req.user.photo
                },
                type: 'group-refused',
                targetGroup: group,
                createDate: new Date()
            });

            // return the updated notification
            res.json(results.updateNotification[0]);
        }
    });

};

acknowledge = function(req, res, next, notification) {

    // mark the notification as confirmed
    notification.result = req.body.result;
    notification.confirmed.addToSet(req.user.id);
    notification.save(function(err, notification) {
        if (err) next(err);
        else res.json(notification);
    });
};