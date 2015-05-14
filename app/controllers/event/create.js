var _ = require('underscore'),
    moment = require('moment'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Event = mongoose.model('Event'),
    Group = mongoose.model('Group'),
    Activity = mongoose.model('Activity'),
    Mailer = require('../../mailer/mailer.js');

module.exports = function(req, res, next) {

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
                            .where('_id').in(group.announcelist)
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

                                group.announcelist.forEach(function(room) {
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