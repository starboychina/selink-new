// Create group
// ---------------------------------------------
// Create new group, and return it
// ---------------------------------------------
// 1. create group with posted content, and set the owner and first participant as current user
// 2. save the group pointer in owner profile
// 3. create owmer activity
// 4. create notification for owner's friends
// 5. create invitation (a kind of notification) for invited people as needed
// 6. commit group to solr
// 7. send real-time notification to owner's friends
// 8. sent real-time invitation to invited people
// 9. send email invitation to invited people
// 10. return the new group to client

var async = require('async'),
    mongoose = require('mongoose'),
    Group = mongoose.model('Group'),
    User = mongoose.model('User'),
    Activity = mongoose.model('Activity'),
    Notification = mongoose.model('Notification'),
    Mailer = require('../../mailer/mailer.js');

var populateField = {
    _owner: 'type firstName lastName title cover photo',
    invited: 'type firstName lastName title cover photo',
    participants: 'type firstName lastName title cover photo'
};

module.exports = function(req, res, next) {

    async.waterfall([

        // create group
        function createGroup(callback) {

            req.body._owner = req.user.id;
            req.body.participants = req.user.id;

            Group.create(req.body, callback);
        },

        function createRelateInfo(group, callback) {

            async.parallel({

                // put group id in creator's group list
                updateUser: function(callback) {

                    req.user.groups.push(group.id);
                    req.user.save(callback);
                },

                // create activity
                createActivity: function(callback) {

                    Activity.create({
                        _owner: req.user.id,
                        type: 'group-new',
                        targetGroup: group.id
                    }, callback);
                },

                // send notificaton to all friends
                createNotification: function(callback) {

                    if (req.user.friends && req.user.friends.length && group.type != 'private')
                        Notification.create({
                            _owner: req.user.friends,
                            _from: req.user.id,
                            type: 'group-new',
                            targetGroup: group.id
                        }, callback);
                    else
                        callback(null);
                },

                // send notificaton to invited people
                createInvitation: function(callback) {

                    if (req.body.invited && req.body.invited.length)
                        Notification.create({
                            _owner: req.body.invited,
                            _from: req.user.id,
                            type: 'group-invited',
                            targetGroup: group.id
                        }, callback);
                    else
                        callback(null);
                },

                // index group in solr
                createSolr: function(callback) {

                    solr.add(group.toSolr(), function(err, result) {
                        if (err) callback(err);
                        else solr.commit(callback);
                    });
                }

            }, function(err, results) {

                if (err) callback(err);
                else callback(null, group, results.createNotification, results.createInvitation);
            });
        },

        function sendMessages(group, notification, invitation, callback) {

            var from = {
                    _id: req.user.id,
                    type: req.user.type,
                    firstName: req.user.firstName,
                    lastName: req.user.lastName,
                    title: req.user.title,
                    cover: req.user.cover,
                    photo: req.user.photo
                };

            if (notification)
                req.user.friends.forEach(function(room) {
                    sio.sockets.in(room).emit('group-new', {
                        _id: notification.id,
                        _from: from,
                        type: 'group-new',
                        targetGroup: group,
                        createDate: new Date()
                    });
                });

            req.body.invited.forEach(function(room) {
                sio.sockets.in(room).emit('group-invited', {
                    _id: invitation.id,
                    _from: from,
                    type: 'group-invited',
                    targetGroup: group,
                    createDate: new Date()
                });
            });

            //send invitation email
            User.find()
                .select('email')
                .where('_id').in(req.body.invited)
                .where('mailSetting.groupInvitation').equals(true)
                .where('logicDelete').equals(false)
                .exec(function(err, users) {
                    if (err) callback(err);
                    else if (users) Mailer.groupInvitation(users, req.user, group);
                });

            // the last result is the new group
            callback(null, group);
        }

    ], function(err, group) {

        if (err) next(err);
        // return the created group
        else res.json(group);
    });
};