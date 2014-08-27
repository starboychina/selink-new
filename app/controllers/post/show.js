// Show single post

var Post = require('mongoose').model('Post');

var populateField = {
    '_owner': 'type firstName lastName title cover photo',
    'comments._owner': 'type firstName lastName title cover photo',
    'group': 'name cover description'
};

module.exports = function(req, res, next) {

    Post.findById(req.params.post)
        .where('logicDelete').equals(false)
        .populate('_owner', 'type firstName lastName title cover photo createDate')
        .populate('group', 'name cover description')
        .populate('comments._owner', 'type firstName lastName title cover photo createDate')
        .exec(function(err, post) {
            if (err) next(err);
            else res.json(post);
        });
};
