var Tag = require('mongoose').model('Tag');

module.exports = function(req, res) {

    if (req.body.tag) {

        req.body.tag.forEach(function(tagData) {
            var newTag = new Tag(tagData, false);
            newTag.save(function(err) {
                if (err) console.log(err);
            });
        });
    }

    res.send('got it');
};
