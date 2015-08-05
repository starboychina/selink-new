// Post index
// ---------------------------------------------
// Return latest 20 posts of current user in descending order of create date.
// In the case of get other user's posts list, user id must passed by the route: '/users/:user/posts'
// In the case of get some group's posts list, group id must passed by the route: '/groups/:group/posts'
// ---------------------------------------------
// Parameter:
//   1. user  : The user's id of posts list belong to, passed by url   default: current uer
//   2. group : The group's id of posts list belong to, passed by url  default: none
//   3. before: A Unix time stamp used as start point of retrive       default: none
//   4. size  : Number of result to return                             default: 20
// ---------------------------------------------

var moment = require('moment'),
    mongoose = require('mongoose'),
    Post = mongoose.model('Post'),
    User = mongoose.model('User'),
    Group = mongoose.model('Group');

var populateField = {
    '_owner': 'type nickName firstName lastName title cover photo',
    'comments._owner': 'type nickName firstName lastName title cover photo',
    'group': 'name cover description'
};

module.exports = function(req, res, next) {

    // TODO: check parameters

    // if the request was get some specific user's posts list
    // we need to find the user from users collection first

    // if specified someone else
    if (req.params.user && req.params.user !== req.user.id) {

        // get the user's posts info (post ids)
        User.findById(req.params.user, 'posts', function(err, uesr) {
            // pass the user to internal method
            if (err) next(err);
            else _post_index(req, res, uesr, null, next);
        });

    // if specified some group
    } else if (req.params.group) {

        // get the group's posts info (post ids)
        Group.findById(req.params.group, 'posts', function(err, group) {
            // pass the group to internal method
            if (err) next(err);
            else _post_index(req, res, null, group, next);
        });

    } else {

        // default to current user
        _post_index(req, res, req.user, null, next);
    }
};

// internal method for index
_post_index = function(req, res, user, group, next) {

    // create query
    var query = Post.find();

    // if request specified user, populate the group.
    // cause the client should have the _owner, so we don't populate _owner
    if (user)
        query.where('_id').in(user.posts)
            .populate('group', populateField['group']);

    // if request specified group, populate the _owner
    // cause the client should have the group, so we don't populate group
    if (group)
        query.where('_id').in(group.posts)
            .populate('_owner', populateField['_owner']);

    // if request items before some time point
    if (req.query.before)
        query.where('createDate').lt(moment.unix(req.query.before).toDate());

    // default query parameter below
    query.select('-removedComments -logicDelete')
        .populate('comments._owner', populateField['comments._owner'])
        .where('logicDelete').equals(false)
        .limit(req.query.size || 20)
        .sort('-createDate')
        .exec(function(err, posts) {
            if (err) next(err);
            else if (posts.length === 0) res.json(404, {});
            else res.json(posts);
        });
};
