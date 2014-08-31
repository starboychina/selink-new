var _ = require('underscore'),
    Announcement = require('mongoose').model('Announcement');

module.exports = function(req, res, next) {

    var newAnnouncement = _.omit(req.body, '_id');

    Announcement.findByIdAndUpdate(req.params.announcement, newAnnouncement, function(err, announcement) {

        if (err) next(err);
        else res.json(announcement);
    });
};
