var Event = require('mongoose').model('Event');

module.exports = function(req, res, next) {

    Event.findByIdAndRemove(req.params.event, function(err, event) {

        if (err) next(err);
        else res.json(event);
    });
};