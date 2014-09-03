// Crop Cover
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

    // TODO: check exsitence of tempCover

    var coverName = req.session.tempCover,
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
                        Key: req.user.id + '/cover/' + req.user.cover,
                        Bucket: config.s3.bucket,
                    }, callback)
                },

                uploadNewCover: function(callback) {

                    s3.putObject({
                        ACL: 'public-read',
                        Key: req.user.id + '/cover/' + coverName,
                        Bucket: config.s3.bucket,
                        Body: buffer,
                        ContentType: mime.lookup(coverPath)
                    }, callback);
                },

                updateUser: function(callback) {

                    User.findByIdAndUpdate(req.params.user, {cover: coverName}, callback);
                }

            }, function(err, results) {

                if (err) callback(err);
                else callback(null, results.updateUser.cover);
            });
        },

        function deleteTempFile(cover, callback) {

            fs.unlink(coverPath, function(err) {
                if (err) callback(err);
                else callback(null, cover);
            });
        }

    ], function(err, cover) {

        if (err) next(err);
        else res.json({cover: cover});
    });





    // var coverPath = path.join(__dirname, '../../public/upload/', req.session.tempCover);

    // gm(coverPath)
    //     .crop(req.body.w, req.body.h, req.body.x, req.body.y)
    //     .write(coverPath, function(err) {
    //         if (err) next(err);
    //         else {

    //             // update user info
    //             User.findByIdAndUpdate(req.params.user, {cover: './upload/' + req.session.tempCover}, function(err, updatedUser) {
    //                 if (err) next(err);
    //                 else res.send({cover: updatedUser.cover});
    //             });
    //         }
    //     });
};