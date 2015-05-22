var Announcement = require('mongoose').model('Announcement');

module.exports = function(req, res, next) {

    Announcement.findById(req.params.id)
        .where('logicDelete').equals(false)
        .exec(function(err, announcements) {
            if (err) next(err);
            else res.render('./mobile/announcements', announcements);
        });
};