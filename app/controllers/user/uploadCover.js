// Upload Cover
var uploadForm = require('../../utils/upload');

module.exports = function(req, res, next) {

    uploadForm.parse(req, function(err, fields, files) {

        // handle cover file
        if (files.cover) {

            var coverType = files.cover.type;
            var coverPath = files.cover.path;

            if (['image/jpeg', 'image/gif', 'image/png'].indexOf(coverType) === -1) {
                res.status(415).send("Only jpeg, gif or png file are valide");
                return;
            }

            var coverName = /.*[\/|\\](.*)$/.exec(coverPath)[1];

            req.session.tempCoverName = coverName;
            req.session.tempCoverType = coverType;

            res.json({fileName: './upload/' + coverName});

        } else res.json(400, {});

    });
};