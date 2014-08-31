var _ = require('underscore'),
    Message = require('mongoose').model('Message');

module.exports = function(req, res, next) {

    // no way to update a sent message, the only updatable field is 'opened' and 'bookmarked'
    if (_.has(req.body, 'opened')) {

        // find that message
        Message.findById(req.params.message, function(err, message) {

            if (err) next(err);
            else {

                if (req.body.opened)
                    // add user to the opened list
                    message.opened.addToSet(req.user.id);
                else
                    message.opened.pull(req.user.id);

                message.save(function(err, newMessage) {

                    if (err) next(err);
                    else {

                        newMessage.populate({path:'_from', select: 'type firstName lastName title cover photo createDate'}, function(err, msg) {

                            if (err) next(err);
                            else res.json(msg);
                        });
                    }
                });
            }
        });

    // send 'bad request'
    } else {
        res.json(400, {});
    }
};