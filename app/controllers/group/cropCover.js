// Scale Cover
var fs = require('fs'),
    gm = require('gm'),
    path = require('path'),
    async = require('async'),
    Group = require('mongoose').model('Group'),
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
                .resize(600, 150)
                .toBuffer(callback);
        },

        function findGroup(buffer, callback) {

            Group.findById(req.params.group, function(err, group) {
                if (err) callback(err);
                else callback(null, buffer, group);
            });
        },

        function updateCover(buffer, group, callback) {

            async.parallel({

                deleteCurrentCover: function(callback) {

                    s3.deleteObject({
                        Key: 'groups/' + group.id + '/cover/' + group.cover,
                        Bucket: config.s3.bucket,
                    }, callback)
                },

                uploadNewCover: function(callback) {

                    s3.putObject({
                        ACL: 'public-read',
                        Key: 'groups/' + group.id + '/cover/' + coverName,
                        Bucket: config.s3.bucket,
                        Body: buffer,
                        ContentType: coverType
                    }, callback);
                }

            }, function(err, results) {

                if (err) callback(err);
                else callback(null, group);
            });
        },

        function updateGroup(group, callback) {

            group.cover = coverName;
            group.save(callback);
        },

        function deleteTempFile(group, numberAffected, callback) {

            fs.unlink(coverPath, function(err) {
                if (err) callback(err);
                else callback(null, group);
            });
        }

    ], function(err, group) {

        if (err) next(err);
        else res.json({
            cover: group.cover,
            cover_ref: group.cover_ref
        });
    });

    // gm(coverPath)
    //     .crop(req.body.w, req.body.h, req.body.x, req.body.y)
    //     .resize(600, 150)
    //     .write(coverPath, function(err) {
    //         if (err) next(err);
    //         else {

    //             // update group info
    //             Group.findByIdAndUpdate(req.params.group, {cover: './upload/' + req.session.tempCover}, function(err, group) {
    //                 if (err) next(err);
    //                 else res.send({cover: group.cover});
    //             });
    //         }
    //     });
};