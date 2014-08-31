var Tag = require('mongoose').model('Tag');

module.exports = function(req, res, next) {

    // look up tag info
    Tag.findById(req.params.id, function(err, tag) {
        if (err) next(err);
        else {

            tag.remove(function(err, removedTag) {
                if (err) next(err);
                else res.send(removedTag);
            });
        }
    });
};