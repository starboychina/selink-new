// Messages index
// ---------------------------------------------
// Return a list of 20 messages in descending order of create date.
// Messages are highly private, all requests are relate to current user and can't be changed
// ---------------------------------------------
// Parameter:
//   1. type  : Messages type, "sent", "unread", "received"        default: received
//   2. before: A Unix time stamp used as start point of retrive   default: none
//   3. size  : Number of result to return                         default: 20
// ---------------------------------------------
var _s = require('underscore.string'),
    moment = require('moment'),
    Message = require('mongoose').model('Message');

var populateField = {
    '_from': 'type firstName lastName title cover photo',
    '_recipient': 'type firstName lastName title cover photo'
};

module.exports = function(req, res, next) {

    // create query
    var query = Message.find();

    // if request specified sent messages
    if (_s.endsWith(req.path, "/sent"))
        query.select('-logicDelete')
            .where('_from').equals(req.user.id)
            .populate('_recipient', populateField['_recipient']);

    // if request specified unread messages
    else if (_s.endsWith(req.path, "/unread"))
        query.select('-_recipient -logicDelete')
            .or({'group':{'$in':req.user.groups}})
            .or({'_recipient':req.user.id})
            .where('opened').ne(req.user.id);

    // default request received messages
    else
        query.select('-_recipient -logicDelete')
            .or({'group':{'$in':req.user.groups}})
            .or({'_recipient':req.user.id})
            .where({'_from':{'$ne':req.user.id}})

    // if request items before some time point
    if (req.query.before)
        query.where('createDate').lt(moment.unix(req.query.before).toDate());

    query.where('logicDelete').ne(req.user.id)
        .populate('_from', populateField['_from'])
        .limit(req.query.size || 20)
        .sort('-createDate')
        .exec(function(err, messages) {
            if (err) next(err);
            else if (messages.length === 0) res.json(404, {});
            else res.json(messages);
        });
};