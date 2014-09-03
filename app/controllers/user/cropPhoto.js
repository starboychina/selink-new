// Crop Photo
var env = process.env.NODE_ENV || 'development',
    config = require('../../../config/global')[env],
    fs = require('fs'),
    gm = require('gm'),
    path = require('path'),
    mime = require('mime'),
    AWS = require('aws-sdk'),
    async = require('async'),
    User = require('mongoose').model('User');

var s3 = new AWS.S3({apiVersion: '2006-03-01'});

module.exports = function(req, res, next) {

    // TODO: check exsitence of tempPhoto

    var photoName = req.session.tempPhoto,
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
                        Key: req.user.id + '/photo/' + req.user.photo,
                        Bucket: config.s3.bucket,
                    }, callback)
                },

                uploadNewPhoto: function(callback) {

                    s3.putObject({
                        ACL: 'public-read',
                        Key: req.user.id + '/photo/' + photoName,
                        Bucket: config.s3.bucket,
                        Body: buffer,
                        ContentType: mime.lookup(photoPath)
                    }, callback);
                },

                updateUser: function(callback) {

                    User.findByIdAndUpdate(req.params.user, {photo: photoName}, callback);
                }

            }, function(err, results) {

                if (err) callback(err);
                else callback(null, results.updateUser.photo);
            });
        },

        function deleteTempFile(photo, callback) {

            fs.unlink(photoPath, function(err) {
                if (err) callback(err);
                else callback(null, photo);
            });
        }

    ], function(err, photo) {

        if (err) next(err);
        else res.json({photo: photo});
    });

};