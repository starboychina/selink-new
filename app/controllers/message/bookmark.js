// bookmark messages
var Message = require('mongoose').model('Message');

module.exports = function(req, res, next){

    // find message
    Message.findById(req.params.message, function(err, message) {

        if (err) next(err);
        else {

            // check if the user bookmarked this message, then toggle it
            if (message.bookmarked.indexOf(req.body.bookmarked) < 0)
                // add one bookmarked people id
                message.bookmarked.addToSet(req.body.bookmarked);
            else
                // remove the people id from bookmarked list
                message.bookmarked.remove(req.body.bookmarked);

            // save the message
            message.save(function(err, newMessage) {
                if (err) next(err);
                else {

                    // populate the message sender
                    // cause if user reply this message just after bookmark it, the sender info is needed.
                    newMessage.populate({path:'_from', select: 'type firstName lastName title cover photo createDate'}, function(err, message) {
                        if(err) next(err);
                        else res.json(message);
                    });
                }
            });
        }
    });
};