var Tag = require('mongoose').model('Tag');

module.exports = function(req, res, next) {

    var initial = req.query.initial;

    Tag.find({name: new RegExp(initial, "i")})
        .select('name count')
        .sort({count:-1})
        .limit(8)
        .exec(function(err, tags) {
            if (err) next(err);
            else res.json(tags);
        });
};