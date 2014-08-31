var _ = require('underscore'),
    Mailer = require('../../mailer/mailer.js'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Announcement = mongoose.model('Announcement');

module.exports = function(req, res, next) {

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