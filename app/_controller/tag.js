var mongoose = require('mongoose'),
    Tag = mongoose.model('Tag');

exports.index = function(req, res, next) {

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

exports.create = function(req, res) {

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

exports.update = function(req, res, next) {

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

exports.remove = function(req, res, next) {

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

exports.suggest = function(req, res, next) {

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