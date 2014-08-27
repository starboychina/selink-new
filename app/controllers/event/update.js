var _ = require('underscore'),
    Event = require('mongoose').model('Event');

module.exports = function(req, res, next) {

    var newEvent = _.omit(req.body, '_id', 'group');

    Event.findByIdAndUpdate(req.params.event, newEvent, function(err, event) {

        if (err) next(err);
        else {

            event.populate({
                path: 'group',
                select: 'name cover description'
            }, function(err, event) {

                if (err) next(err);
                else res.json(event);
            });
        }
    });
};