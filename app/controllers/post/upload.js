// Upload Photo
var uploadForm = require('../../utils/upload');

module.exports = function(req, res, next) {

    // TODO: check file size and type

    uploadForm.parse(req, function(err, fields, files) {

        console.log(err)
        console.log(fields)
        console.log(files)

        // handle photo file
        if (files.image) {

            var imageType = files.image.type;
            var imagePath = files.image.path;

            if (['image/jpeg', 'image/gif', 'image/png'].indexOf(imageType) === -1) {
                res.status(415).send("");
                return;
            }

            var imageName = /.*[\/|\\](.*)$/.exec(imagePath)[1];

            req.session.tempimage = imageName;

            res.json({
                remoteName: imageName,
                remoteType: imageType
            });

        } else if (files.video) {

            var videoType = files.video.type;
            var videoPath = files.video.path;

            if (['video/quicktime', 'video/mp4'].indexOf(videoType) === -1) {
                res.status(415).send("");
                return;
            }

            var videoName = /.*[\/|\\](.*)$/.exec(videoPath)[1];

            req.session.tempvideo = videoName;

            res.json({
                remoteName: videoName,
                remoteType: videoType
            });

        } else {
            res.json(400, {});
        }
    });
};