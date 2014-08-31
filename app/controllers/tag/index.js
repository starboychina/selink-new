var Tag = require('mongoose').model('Tag');

module.exports = function(req, res, next) {

    // page number
    var page = req.query.page || 0;

    Tag.find()
        .where('logicDelete').equals(false)
        .sort({count:-1})
        .skip(100*page)  // skip n page
        .limit(100)  // 100 user per page
        .exec(function(err, tags) {
            if(err) next(err);
            else res.json(tags);
        });
};