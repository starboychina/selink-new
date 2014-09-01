// Upload Cover
var gm = require('gm'),
    formidable = require('formidable');

// parse a file upload
var formidableForm = new formidable.IncomingForm({
    uploadDir: __dirname + '../../../../public/upload',
    keepExtensions: true
});

module.exports = function(req, res, next) {

    formidableForm.parse(req, function(err, fields, files) {

        // handle cover file
        if (files.cover) {

            var coverType = files.cover.type;
            var coverPath = files.cover.path;

            if (['image/jpeg', 'image/gif', 'image/png'].indexOf(coverType) === -1) {
                res.status(415).send("Only jpeg, gif or png file are valide");
                return;
            }

            var coverName = /.*[\/|\\](.*)$/.exec(coverPath)[1];

            req.session.tempCover = coverName;

            gm(coverPath).size(function(err, size) {
                if (err) next(err);
                else res.json({fileName: './upload/' + coverName});
            });

        } else {
            res.json(400, {});
        }
    });
};
