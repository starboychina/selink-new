// Scale Photo
var gm = require('gm'),
    path = require('path'),
    AWS = require('aws-sdk'),
    User = require('mongoose').model('User');

var s3 = new AWS.S3({apiVersion: '2006-03-01'});

module.exports = function(req, res, next) {

    // TODO: check exsitence of tempPhoto

    var photoName = req.session.tempPhoto;
    var photoPath = path.join(__dirname, '../../public/upload/', photoName);
    var contentType = 'application/octet-stream';
    var remotePath = 'https://s3-ap-northeast-1.amazonaws.com/selink-dev/' + req.user.id + '/' + photoName;

    if (photoName.indexOf('.jpg') >= 0) contentType = 'image/jpg';
    else if (photoName.indexOf('.jpeg') >= 0) contentType = 'image/jpg';
    else if (photoName.indexOf('.gif') >= 0) contentType = 'image/gif';
    else if (photoName.indexOf('.png') >= 0) contentType = 'image/png';

    gm(photoPath)
        .crop(req.body.w, req.body.h, req.body.x, req.body.y)
        .resize(200, 200)
        .toBuffer(function (err, buffer) {
            if (err) next(err);
            else {

                s3.putObject({
                    ACL: 'public-read',
                    Bucket: 'selink-dev',
                    Key: req.user.id + '/' + photoName,
                    Body: buffer,
                    ContentType: contentType
                }, function(err, response) {

                    if (err) next(err);
                    else {

                        // update user info
                        User.findByIdAndUpdate(req.params.user, {photo: remotePath}, function(err, updatedUser) {
                            if (err) next(err);
                            else res.send({photo: updatedUser.photo});
                        });
                    }
                });
            }
        });
        // .write(photoPath, function(err) {
        //     if (err) next(err);
        //     else {

        //         // update user info
        //         User.findByIdAndUpdate(req.params.user, {photo: './upload/' + req.session.tempPhoto}, function(err, updatedUser) {
        //             if (err) next(err);
        //             else res.send({photo: updatedUser.photo});
        //         });
        //     }
        // });
};