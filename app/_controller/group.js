var _ = require('underscore'),
    _s = require('underscore.string'),
    gm = require('gm'),
    util = require('util'),
    path = require('path'),
    async = require('async'),
    moment = require('moment'),
    formidable = require('formidable'),
    mongoose = require('mongoose'),
    Mailer = require('../mailer/mailer.js'),
    Group = mongoose.model('Group'),
    User = mongoose.model('User'),
    Activity = mongoose.model('Activity'),
    Notification = mongoose.model('Notification');

var populateField = {
    _owner: 'type firstName lastName title cover photo',
    invited: 'type firstName lastName title cover photo',
    participants: 'type firstName lastName title cover photo'
};

// parse a file upload
var foridableForm = new formidable.IncomingForm({
    uploadDir: __dirname + '../../../public/upload',
    keepExtensions: true
});

// Group index
// ---------------------------------------------
// Return latest 20 groups of current user in descending order of create date.
// In the case of get some user's groups list, user id must passed by the route: '/users/:user/groups'
// ---------------------------------------------
// Parameter:
//   1. user  : The user's id of groups list belong to, passed by url        default: current user
//   2. type  : The type of groups, identified by the path of request        default: joined
//                a. mine     -- the groups belong to user
//                b. joined   -- the groups user had joined
//                c. discover -- the groups that have no connection to user
//   3. before: A Unix time stamp used as start point of retrive             default: none
//   4. size  : Number of result to return                                   default: 20
// ---------------------------------------------

exports.index = function(req, res, next) {

    // TODO: check parameters

    // if the request was get some specific user's groups list
    // we need to get the user from users collection

    // if specified someone other than current user
    if (req.params.user && req.params.user !== req.user.id) {

        // get the user's groups info (group ids)
        User.findById(req.params.user, 'groups', function(err, uesr) {
            // pass the user to internal method
            if (err) next(err);
            else _group_index(req, res, uesr, next);
        });

    } else {

        // no specified user, pass null to internal method
        _group_index(req, res, req.user, next);
    }
};

// internal method for index
_group_index = function(req, res, user, next) {

    // create query
    var query = Group.find();

    // if request "mine" groups
    if (_s.endsWith(req.path, "/mine"))
        query.where('_owner').equals(user.id);

    // if request "discover" groups
    else if (_s.endsWith(req.path, "/discover"))
        query.where('_id').nin(user.groups)
            .where('type').ne('private');

    // default to joined groups
    else
        query.where('_id').in(user.groups);

    // if request items before some time point
    if (req.query.before)
        query.where('createDate').lt(moment.unix(req.query.before).toDate());

    query.select('_owner type name cover description participants posts events createDate')
        .where('logicDelete').equals(false)
        .limit(req.query.size || 20)
        .sort('-createDate')
        .exec(function(err, groups) {
            if (err) next(err);
            else if (groups.length === 0) res.json(404, {});
            else res.json(groups);
        });
};

// Get single Group
// ---------------------------------------------
// Retrun user profile info except password

exports.show = function(req, res, next) {

    // check on logic delete flag, return 404 on not found

    Group.findById(req.params.group)
        .select('-logicDelete')
        .where('logicDelete').equals(false)
        .populate('_owner', populateField['_owner'])
        .exec(function(err, group) {
            if (err) next(err);
            else res.json(group);
        });
};

// Group Connection
// ---------------------------------------------
// Return 20 people's info of the group member/invited member in descending order of create date.
// ---------------------------------------------
// Parameter:
//   1. group : The group id of user list belong to, passed by url           default: none
//   2. type  : The type of member, identified by the path of request        default: participants
//                a. participants  -- the groups belong to user
//                b. invited       -- the groups user had joined
//   3. before: A Unix time stamp used as start point of retrive             default: none
//   4. size  : Number of result to return                                   default: 20
// ---------------------------------------------

exports.connections = function(req, res, next) {

    // TODO: check parameters

    // create query
    var query = Group.findById(req.params.group)
                    .where('logicDelete').equals(false);

    // if request invited people
    if (_s.endsWith(req.path, "/invited"))
        query.select('invited')
            .populate('invited', populateField['invited'])
            .exec(function(err, group) {
                if (err) next(err);
                else res.json(group.invited);
            });

    // default to participants
    else
        query.select('participants')
            .populate('participants', populateField['participants'])
            .exec(function(err, group) {
                if (err) next(err);
                else res.json(group.participants);
            });

};

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

exports.create = function(req, res, next) {

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

// Update group
// ---------------------------------------------
// Update a group, and return the updated group
// ---------------------------------------------
// 1. find group with its Id
// 2. update the group
// 3. update the group in solr
// 4. return the group to client

exports.update = function(req, res, next) {

    async.waterfall([

        // update group info
        function updateGroup(callback) {

            // we will use req.body as update paremeter, so:
            // delete _id, cause you can't update _id, it will be error if it exists
            // delete invited, if you want invite someone, use the invite interface
            delete req.body._id;
            delete req.body.invited;

            Group.findByIdAndUpdate(req.params.group, req.body, callback);
        },

        // update solr
        function updateSolr(group, callback) {

            solr.add(group.toSolr(), function(err, result) {
                if (err) callback(err);
                else solr.commit(function(err, result) {
                    if (err) callback(err);
                    else callback(null, group);
                });
            });
        }

    ], function(err, group) {

        if (err) next(err);
        // return the updated group
        else res.json(group);
    });
};

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

exports.invite = function(req, res, next) {

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
        else res.json(group);
    });

};

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

exports.expel = function(req, res, next) {

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
        else res.json(group);
    });

}

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

exports.join = function(req, res, next) {

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
                    // add user id to group participants
                    group.participants.addToSet(req.user.id);
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
        else res.json(group);
    });
};

// Apply to join group
// ---------------------------------------------
// Update the 'applicants' field of a group, and return the updated group
// ---------------------------------------------
// 1. find group with its Id
// 2. update the user
// 3. update the group
// 4. create activity for current user
// 5. create notification for group owner
// 6. send real time message to group owner
// 7. send email to group owner
// 8. return the group to client

exports.apply = function(req, res, next) {

    async.waterfall([

        // find group
        function findGroup(callback) {

            Group.findById(req.params.group, callback);
        },

        // apply to join the group
        function joinGroup(group, callback) {

            async.parallel({

                // save the group id in user profile
                updateUser: function(callback) {

                    req.user.applying.addToSet(group.id);
                    req.user.save(callback);
                },

                // save the user id in group's applicants
                updateGroup: function(callback) {

                    // add user id to group applicants
                    group.applicants.addToSet(req.user.id);
                    // update group
                    group.save(callback);
                },

                // log user's activity
                createActivity: function(callback) {

                    Activity.create({
                        _owner: req.user.id,
                        type: 'group-applied',
                        targetGroup: group.id
                    }, callback);
                },

                // create notification for group owner
                createNotification: function(callback) {

                    Notification.create({
                        _owner: group._owner,
                        _from: req.user.id,
                        type: 'group-applied',
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
            sio.sockets.in(group._owner).emit('group-applied', {
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
                type: 'group-applied',
                targetGroup: group,
                createDate: new Date()
            });

            // send email to group owner
            User.findById(group._owner)
                .select('email')
                .where('mailSetting.groupApplied').equals(true)
                .where('logicDelete').equals(false)
                .exec(function(err, recipient) {
                    if (err) callback(err);
                    else if (recipient) Mailer.groupApplied(recipient, req.user, group);
                });

            callback(null, group);
        }

    ], function(err, group) {

        if (err) next(err);
        // return the updated group
        else res.json(group);
    });
};

// Upload Cover
exports.uploadCover = function(req, res, next) {

    foridableForm.parse(req, function(err, fields, files) {

        // handle cover file
        if (files.cover) {

            var coverType = files.cover.type;
            var coverPath = files.cover.path;

            if (['image/jpeg', 'image/gif', 'image/png'].indexOf(coverType) === -1) {
                res.status(415).send("Only jpeg, gif or png file are valide");
                return;
            }

            var coverName = /.*[\/|\\](.*)$/.exec(coverPath)[1];

            req.session.tempCover = coverName;

            gm(coverPath).size(function(err, size) {
                if (err) next(err);
                else res.json({fileName: './upload/' + coverName});
            });

        } else res.json(400, {});

    });
};

// Scale Cover
exports.scaleCover = function(req, res, next) {

    // TODO: check exsitence of tempCover

    var coverPath = path.join(__dirname, '../../public/upload/', req.session.tempCover);

    gm(coverPath)
        .crop(req.body.w, req.body.h, req.body.x, req.body.y)
        .resize(600, 150)
        .write(coverPath, function(err) {
            if (err) next(err);
            else {

                // update group info
                Group.findByIdAndUpdate(req.params.group, {cover: './upload/' + req.session.tempCover}, function(err, group) {
                    if (err) next(err);
                    else res.send({cover: group.cover});
                });
            }
        });
};