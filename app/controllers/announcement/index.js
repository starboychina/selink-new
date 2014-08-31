var Announcement = require('mongoose').model('Announcement');

module.exports = function(req, res, next) {

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