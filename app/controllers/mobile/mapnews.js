var moment = require('moment'),
    Post = require('mongoose').model('Post');

var populateField = {
    '_owner': 'type nickName firstName lastName title cover photo',
    'comments._owner': 'type nickName firstName lastName title cover photo',
    'group': 'name cover description'
};

module.exports = function(req, res, next) {

    // create query
    var query = Post.find();

    // query posts belong to current user and his/her friends and groups
    // query.or([
    //     {_owner: req.user.id},
    //     {_owner: {$in: req.user.friends}},
    //     {group: {$in: req.user.groups}}
    // ]);

    query.select('-removedComments -logicDelete')
        .where('logicDelete').equals(false)
        .where('coordinate').exists(true)
        .populate('_owner', populateField['_owner'])
        .populate('group', populateField['group'])
        .populate('comments._owner', populateField['comments._owner'])
        .limit(req.query.size || 20)
        .sort('-createDate')
        .exec(function(err, posts) {
            if (err) next(err);
            else if (posts.length === 0) res.json(404, {});
            else res.json(posts);
        });
};
