var async = require('async'),
    moment = require('moment'),
    Message = require('mongoose').model('Message');

module.exports = function(req, res, next) {

    async.parallel({

        openMessages: function(callback) {
            Message.where('_from').equals(req.params.user)
                .where('_recipient').equals(req.user.id)
                .where('logicDelete').ne(req.user.id)
                .setOptions({ multi: true })
                .update({ $addToSet: {opened: req.user.id} }, callback);
        },

        readMessages: function(callback) {

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
                .exec(callback);
        }

    }, function(err, result) {
        if (err) next(err);
        else if (result.readMessages.length === 0) res.json(404, {});
        else res.json(result.readMessages);
    });
};
