var _ = require('underscore'),
    mongoose = require('mongoose'),
    moment = require('moment'),
    Mailer = require('../mailer/mailer.js'),
    User = mongoose.model('User'),
    Event = mongoose.model('Event'),
    Group = mongoose.model('Group'),
    Activity = mongoose.model('Activity');

var populateField = {
    'group': 'name cover description'
};

// Events index
// ---------------------------------------------
// Return a list of 20 events of current user, in descending order of start date.
// You can get the events in a specific time span, by using the "from" and "to" parameter
// In the case of get some user's events list, user id must passed by the route: '/users/:user/events'
// In the case of get some group's events list, group id must passed by the route: '/groups/:group/events'
// ---------------------------------------------
// Parameter:
//   1. user  : The user's id of posts list belong to, passed by url   default: current user
//   2. group : The group's id of posts list belong to, passed by url  default: none
//   3. start : A Unix timestamp for start point of a time span        default: none
//   4. end   : A Unix timestamp for end point of a time span          default: none
//   5. after : A Unix time stamp used as start point of retrive       default: none
//   6. size  : Number of result to return                             default: 20
// ---------------------------------------------

exports.index = function(req, res, next) {

    // create query
    var query = Event.find();

    // if request specified user
    if (req.params.user && req.params.user !== req.user.id)
        query.where('_owner').equals(req.params.user);

    // if request specified group
    else if (req.params.group)
        query.where('group').equals(req.params.group);

    // default to current user and his group
    else
        query.or([{_owner: req.user.id}, {group: {$in: req.user.groups}}]);

    // if request specified time span start point
    if (req.query.start)
        query.where('start').gt(moment.unix(req.query.start).toDate());

    // if request specified time span end point
    if (req.query.end)
        query.where('start').lt(moment.unix(req.query.end).toDate());

    // if request items after some time point
    // note that the "limit" will affect query only in this case
    if (req.query.after) {
        query.where('start').gt(moment.unix(req.query.after).toDate())
            .limit(req.query.size || 20);
    }

    query.select('-logicDelete')
        .where('logicDelete').equals(false)
        .populate('group', populateField['group'])
        .sort('start')
        .exec(function(err, events) {
            if (err) next(err);
            else if (events.length === 0) res.json(404, {});
            else res.json(events);
        });

};

// Events count
// ---------------------------------------------
// Return the future events number of current user, in request specified criteria.
// ---------------------------------------------
// Parameter:
//   1. user  : The user's id of events list belong to, passed by url  default: current user
//   2. group : The group's id of events list belong to, passed by url default: none
// ---------------------------------------------

exports.count = function(req, res, next) {

    // create query
    var query = Event.count();

    // if request specified user
    if (req.params.user && req.params.user !== req.user.id)
        query.where('_owner').eq(req.params.user);

    // if request specified group
    else if (req.params.group)
        query.where('group').eq(req.user.groups);

    // default to current user and his group
    else
        query.or([{_owner: req.user.id}, {group: {$in: req.user.groups}}]);

    query.where('start').gt(new Date())
        .where('logicDelete').equals(false)
        .exec(function(err, count) {
            if (err) next(err);
            else res.json({count: count});
        });
};

exports.create = function(req, res, next) {

    _.extend(req.body, {_owner: req.user.id});

    Event.create(req.body, function(err, newEvent) {

        if (err) next(err);
        else {

            if (newEvent.group)　{

                Group.findByIdAndUpdate(newEvent.group, {$addToSet: {events: newEvent._id}}, function(err, group) {
                    if (err) next(err);
                    else {

                        // create activity
                        Activity.create({
                            _owner: req.user.id,
                            type: 'group-event-new',
                            targetEvent: newEvent._id,
                            targetGroup: group._id
                        }, function(err, activity) {
                            if (err) next(err);
                        });

                        var startDate = newEvent.start ? moment(newEvent.start).format('L HH:mm') : "",
                            endDate = newEvent.end ? moment(newEvent.end).format('L HH:mm') : "";

                        // TODO: send email to group participants
                        User.find()
                            .select('email')
                            .where('_id').in(group.participants)
                            .where('logicDelete').equals(false)
                            .exec(function(err, users) {
                                // send new-post mail
                                Mailer.newEvent(users, {
                                    _id: group._id,
                                    ownerId: req.user.id,
                                    ownerName: req.user.firstName + ' ' + req.user.lastName,
                                    ownerPhoto: req.user.photo,
                                    groupName: group.name,
                                    eventName: newEvent.title,
                                    cover: group.cover,
                                    memo: newEvent.memo,
                                    startDate: startDate,
                                    endDate: endDate
                                });
                            });

                        newEvent.populate({
                            path: 'group',
                            select: 'name cover description'
                        }, function(err, event) {

                            if (err) next(err);
                            else {

                                group.participants.forEach(function(room) {
                                    sio.sockets.in(room).emit('group-event-new', event);
                                });
                            }
                        });

                        res.json(newEvent);
                    }
                });
            } else {

                Activity.create({
                    _owner: req.user.id,
                    type: 'event-new',
                    targetEvent: newEvent._id
                }, function(err, activity) {
                    if (err) next(err);
                });

                res.json(newEvent);
            }
        }
    });
};

exports.update = function(req, res, next) {

    var newEvent = _.omit(req.body, '_id', 'group');

    Event.findByIdAndUpdate(req.params.event, newEvent, function(err, event) {

        if (err) next(err);
        else {

            event.populate({
                path: 'group',
                select: 'name cover description'
            }, function(err, event) {

                if (err) next(err);
                else res.json(event);
            });
        }
    });
};

exports.remove = function(req, res, next) {

    Event.findByIdAndRemove(req.params.event, function(err, event) {

        if (err) next(err);
        else res.json(event);
    });
};