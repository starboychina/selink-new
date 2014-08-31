var Message = require('mongoose').model('Message');

module.exports = function(req, res, next) {

    // message could be sent to multiple people,
    // one recipient deleted it dosen't mean the other recipients delete it.
    // so message's logicDelete flag is an array, filled by the user's id who deleted it

    // find the message
    Message.findById(req.params.message, function(err, message) {

        if (err) next(err);
        else {

            // mark it as logical deleted by this user
            message.logicDelete.addToSet(req.user.id);

            message.save(function(err, deletedMessage) {

                if (err) next(err);
                else res.json(deletedMessage);
            });
        }
    });
};