var _ = require('underscore'),
    Mailer = require('../mailer/mailer.js'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Announcement = mongoose.model('Announcement');

exports.index = function(req, res, next) {

    // page number
    var page = req.query.page || 0;

    Announcement.find()
        .where('logicDelete').equals(false)
        .populate('_owner', 'firstName lastName photo')
        .skip(20*page)  // skip n page
        .limit(20)
        .sort('-createDate')
        .exec(function(err, announcements) {
            if (err) next(err);
            else res.json(announcements);
        });
};

exports.create = function(req, res, next) {

    _.extend(req.body, {_owner: req.user.id});

    Announcement.create(req.body, function(err, announcement) {

        if (err) next(err);
        else {
            announcement.populate('_owner', 'firstName lastName photo', function(err, announcement){
                if (err) next(err);
                else {

                    // send email to all users
                    User.find()
                        .select('email')
                        .where('title').ne('fake user')
                        .where('logicDelete').equals(false)
                        .exec(function(err, users) {
                            // send new-announcement mail
                            Mailer.newAnnouncement(users, announcement);
                        });

                    res.json(announcement);
                }
            });
        }
    });
};

exports.update = function(req, res, next) {

    var newAnnouncement = _.omit(req.body, '_id');

    Announcement.findByIdAndUpdate(req.params.announcement, newAnnouncement, function(err, announcement) {

        if (err) next(err);
        else res.json(announcement);
    });
};

exports.remove = function(req, res, next) {

    Announcement.findByIdAndRemove(req.params.announcement, function(err, announcement) {

        if (err) next(err);
        else res.json(announcement);
    });
};