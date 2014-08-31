var Announcement = require('mongoose').model('Announcement');

module.exports = function(req, res, next) {

    Announcement.findByIdAndRemove(req.params.announcement, function(err, announcement) {

        if (err) next(err);
        else res.json(announcement);
    });
};