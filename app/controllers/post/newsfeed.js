// NewsFeed
// ---------------------------------------------
// Return the latest 20 posts of current user's friends and groups, in descending order of create date.
// ---------------------------------------------
// Parameter:
//   1. before: A Unix time stamp used as start point of retrive     default: none
//   2. size  : record number of query                               default: 20
// ---------------------------------------------

var moment = require('moment'),
    Post = require('mongoose').model('Post');

var populateField = {
    '_owner': 'type firstName lastName title cover photo',
    'comments._owner': 'type firstName lastName title cover photo',
    'group': 'name cover description'
};

module.exports = function(req, res, next) {

    // create query
    var query = Post.find();

    // query posts belong to current user and his/her friends and groups
    query.or([
        {_owner: req.user.id},
        {_owner: {$in: req.user.friends}},
        {group: {$in: req.user.groups}}
    ]);

    // if request items before some time point
    if (req.query.before)
        query.where('createDate').lt(moment.unix(req.query.before).toDate());

    query.select('-removedComments -logicDelete')
        .populate('_owner', populateField['_owner'])
        .populate('group', populateField['group'])
        .populate('comments._owner', populateField['comments._owner'])
        .where('logicDelete').equals(false)
        .limit(req.query.size || 20)
        .sort('-createDate')
        .exec(function(err, posts) {
            if (err) next(err);
            else if (posts.length === 0) res.json(404, {});
            else {
                for (var i = posts.length - 1; i >= 0; i--) {
                    posts[i].contentText = posts[i].content.replace(/<[^>]*>/g, '')
                };
                res.json(posts);
            }
        });
};