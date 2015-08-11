var moment = require('moment'),
    Message = require('mongoose').model('Message');

module.exports = function(req, res, next) {

    Message.where('_from').equals(req.params.user)
        .where('_recipient').equals(req.user.id)
        .where('logicDelete').ne(req.user.id)
        .setOptions({ multi: true })
        .update({ $addToSet: {opened: req.user.id} }, function(err, messages) {
            if (err) next(err);
            else res.json();
        });
};
