var moment = require('moment'),
    Message = require('mongoose').model('Message');

module.exports = function(req, res, next) {

    console.log('############# open')

    Message.where('_from').equals(req.params.user)
        .where('_recipient').equals(req.params.user)
        .where('logicDelete').ne(req.user.id)
        .setOptions({ multi: true })
        .update({ opened: {$addToSet: req.user.id} }, function(err, messages) {
            if (err) next(err);
            else res.json();
        });
};
