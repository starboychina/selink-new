var moment = require('moment'),
    Notification = require('mongoose').model('Notification');

var populateField = {
    '_from': 'type nickName firstName lastName title cover photo'
};

module.exports = function(req, res, next) {

    // create query
    var query = Notification.find({"type":{"$in":["post-bookmarked","post-liked"]}});

    // notifications are relate with current user
    query.where('_owner').equals(req.user.id);
    query.where('confirmed').ne(req.user.id)
        .setOptions({ multi: true })
        .update({ $addToSet: {confirmed: req.user.id} }, callback);
    res.json({});

};