// Upload Photo
var uploadForm = require('../../utils/upload');

module.exports = function(req, res, next) {

    uploadForm.parse(req, function(err, fields, files) {

        // handle photo file
        if (files.photo) {

            var photoType = files.photo.type;
            var photoPath = files.photo.path;

            if (['image/jpeg', 'image/gif', 'image/png'].indexOf(photoType) === -1) {
                res.status(415).send("Only jpeg, gif or png file are valide");
                return;
            }

            var photoName = /.*[\/|\\](.*)$/.exec(photoPath)[1];

            req.session.tempPhotoName = photoName;
            req.session.tempPhotoType = photoType;

            res.json({fileName: './upload/' + photoName});

        } else {
            res.json(400, {});
        }
    });
};