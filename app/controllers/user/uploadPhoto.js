// Upload Photo
var env = process.env.NODE_ENV || 'development',
    config = require('../../../config/global')[env],
    gm = require('gm'),
    path = require('path'),
    formidable = require('formidable');

// parse a file upload
var formidableForm = new formidable.IncomingForm({
    uploadDir: path.join(config.root + '/public/upload'),
    keepExtensions: true
});

module.exports = function(req, res, next) {

    formidableForm.parse(req, function(err, fields, files) {

        // handle photo file
        if (files.photo) {

            var photoType = files.photo.type;
            var photoPath = files.photo.path;

            if (['image/jpeg', 'image/gif', 'image/png'].indexOf(photoType) === -1) {
                res.status(415).send("Only jpeg, gif or png file are valide");
                return;
            }

            var photoName = /.*[\/|\\](.*)$/.exec(photoPath)[1];

            req.session.tempPhoto = photoName;

            gm(photoPath).size(function(err, size) {
                if (err) next(err);
                else res.json({fileName: './upload/' + photoName});
            });

        } else {
            res.json(400, {});
        }
    });
};