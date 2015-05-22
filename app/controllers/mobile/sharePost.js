// Show single post

var Post = require('mongoose').model('Post');

var populateField = {
    '_owner': 'type firstName lastName title cover photo',
    'comments._owner': 'type firstName lastName title cover photo',
    'group': 'name cover description'
};

module.exports = function(req, res, next) {
    // if(req.query.isappinstalled==1){
    //     res.redirect('genbatomo://post/'+req.params.id)
    //     return;
    // }
    Post.findById(req.params.id)
        .where('logicDelete').equals(false)
        .populate('_owner', 'type firstName lastName title cover photo createDate')
        .populate('group', 'name cover description')
        .populate('comments._owner', 'type firstName lastName title cover photo createDate')
        .exec(function(err, post) {
            if (err) next(err);
            else res.render('./share/post', post);
        });
};
