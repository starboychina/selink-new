var moment = require('moment'),
    Message = require('mongoose').model('Message');

module.exports = function(req, res, next) {

    // create query
    var query = Message.find();

    // if request items before some time point
    if (req.query.before)
        query.where('createDate').lt(moment.unix(req.query.before).toDate());

    query.select('_recipient _from content opened createDate')
        .where('_from').in([req.user.id, req.params.user])
        .where('_recipient').in([req.user.id, req.params.user])
        .where('logicDelete').ne(req.user.id)
        .limit(req.query.size || 20)
        .sort('-createDate')
        .exec(function(err, messages) {
            if (err) next(err);
            else if (messages.length === 0) res.json(404, {});
            else res.json(messages);
        });
};
