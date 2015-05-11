// Message count
// ---------------------------------------------
// Return the number messages of current user, in request specified criteria.
// Messages are private, all requests are relate to current user and can't be changed
// ---------------------------------------------
// Parameter:
//   1. type  : The type of messages, "sent", "unread", "received" default: received
// ---------------------------------------------
var _s = require('underscore.string'),
    Message = require('mongoose').model('Message');

module.exports = function(req, res, next) {

    // create query
    var query = Message.count();

    // if request specified sent messages
    if (_s.endsWith(req.path, "/sent/count"))
        query.where('_from').equals(req.user.id);

    // if request specified unread messages
    else if (_s.endsWith(req.path, "/unread/count"))
        query
            .or({'group':{'$in':req.user.groups}})
            .or({'_recipient':req.user.id})
            .where('opened').ne(req.user.id);

    // default request received messages
    else
        query
            .or({'group':{'$in':req.user.groups}})
            .or({'_recipient':req.user.id})

    query.where('logicDelete').ne(req.user.id)
        .exec(function(err, count) {
            if (err) next(err);
            else res.json({count: count});
        });
};