var Tag = require('mongoose').model('Tag');

module.exports = function(req, res, next) {

    // look up tag info
    Tag.findById(req.params.id, function(err, tag) {
        if (err) next(err);
        else {

            for(var prop in req.body) {
                tag[prop] = req.body[prop];
            }

            tag.save(function(err, newTag) {
                if (err) next(err);
                else res.send(newTag);
            });
        }
    });
};
