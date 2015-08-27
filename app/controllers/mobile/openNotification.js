var moment = require('moment'),
    Notification = require('mongoose').model('Notification');

module.exports = function(req, res, next) {

    // create query
    var query = Notification.find({"type":{"$in":["post-bookmarked","post-liked"]}});

    // notifications are relate with current user
    query.where('_owner').equals(req.user.id);
    query.where('confirmed').ne(req.user.id)
        .setOptions({ multi: true })
        .update({ $addToSet: {confirmed: req.user.id} }, function(err, updatecount){
            if (err) next(err)
            else res.json({})
        });

};