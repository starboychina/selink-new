// Scale Cover
var gm = require('gm'),
    path = require('path'),
    User = require('mongoose').model('User');

module.exports = function(req, res, next) {

    // TODO: check exsitence of tempCover

    var coverPath = path.join(__dirname, '../../public/upload/', req.session.tempCover);

    gm(coverPath)
        .crop(req.body.w, req.body.h, req.body.x, req.body.y)
        .write(coverPath, function(err) {
            if (err) next(err);
            else {

                // update user info
                User.findByIdAndUpdate(req.params.user, {cover: './upload/' + req.session.tempCover}, function(err, updatedUser) {
                    if (err) next(err);
                    else res.send({cover: updatedUser.cover});
                });
            }
        });
};