// Crop Photo
var fs = require('fs'),
    gm = require('gm'),
    path = require('path'),
    async = require('async'),
    User = require('mongoose').model('User'),
    s3 = require('../../utils/aws').s3;

module.exports = function(req, res, next) {

    // TODO: check exsitence of tempPhoto

    var photoName = req.session.tempPhotoName,
        photoType = req.session.tempPhotoType,
        photoPath = path.join(config.root, '/public/upload/', photoName);

    async.waterfall([

        function resize(callback) {

            gm(photoPath)
                .crop(req.body.w, req.body.h, req.body.x, req.body.y)
                .resize(200, 200)
                .toBuffer(callback);
        },

        function updatePhoto(buffer, callback) {

            async.parallel({

                deleteCurrentPhoto: function(callback) {

                    s3.deleteObject({
                        Key: 'users/' + req.user.id + '/photo/' + req.user.photo,
                        Bucket: config.s3.bucket,
                    }, callback)
                },

                uploadNewPhoto: function(callback) {

                    s3.putObject({
                        ACL: 'public-read',
                        Key: 'users/' + req.user.id + '/photo/' + photoName,
                        Bucket: config.s3.bucket,
                        Body: buffer,
                        ContentType: photoType
                    }, callback);
                },

                updateUser: function(callback) {

                    User.findByIdAndUpdate(req.params.user, {photo: photoName}, callback);
                }

            }, function(err, results) {

                if (err) callback(err);
                else callback(null, results.updateUser);
            });
        },

        function deleteTempFile(user, callback) {

            fs.unlink(photoPath, function(err) {
                if (err) callback(err);
                else callback(null, user);
            });
        }

    ], function(err, user) {

        if (err) next(err);
        else res.json({
            photo: user.photo,
            photo_ref: user.photo_ref
        });
    });

};