// Crop Cover
var fs = require('fs'),
    gm = require('gm'),
    path = require('path'),
    async = require('async'),
    User = require('mongoose').model('User'),
    s3 = require('../../utils/aws').s3;

module.exports = function(req, res, next) {

    // TODO: check exsitence of tempCover

    var coverName = req.session.tempCoverName,
        coverType = req.session.tempCoverType,
        coverPath = path.join(config.root, '/public/upload/', coverName);

    async.waterfall([

        function resize(callback) {

            gm(coverPath)
                .crop(req.body.w, req.body.h, req.body.x, req.body.y)
                .toBuffer(callback);
        },

        function updateCover(buffer, callback) {

            async.parallel({

                deleteCurrentCover: function(callback) {

                    s3.deleteObject({
                        Key: 'users/' + req.user.id + '/cover/' + req.user.cover,
                        Bucket: config.s3.bucket,
                    }, callback)
                },

                uploadNewCover: function(callback) {

                    s3.putObject({
                        ACL: 'public-read',
                        Key: 'users/' + req.user.id + '/cover/' + coverName,
                        Bucket: config.s3.bucket,
                        Body: buffer,
                        ContentType: coverType
                    }, callback);
                },

                updateUser: function(callback) {

                    User.findByIdAndUpdate(req.params.user, {cover: coverName}, callback);
                }

            }, function(err, results) {

                if (err) callback(err);
                else callback(null, results.updateUser);
            });
        },

        function deleteTempFile(user, callback) {

            fs.unlink(coverPath, function(err) {
                if (err) callback(err);
                else callback(null, user);
            });
        }

    ], function(err, user) {

        if (err) next(err);
        else res.json({
            cover: user.cover,
            cover_ref: user.cover_ref
        });
    });

};