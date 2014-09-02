// Upload Photo
var gm = require('gm'),
    formidable = require('formidable');

// parse a file upload
var formidableForm = new formidable.IncomingForm({
    uploadDir: __dirname + '../../../../public/upload',
    keepExtensions: true
});

module.exports = function(req, res, next) {

    formidableForm.on('progress', function(bytesReceived, bytesExpected) {

        sio.sockets.in(req.user.id).emit('progress', {
            progress: bytesReceived/bytesExpected * 100,
        });

    });

    formidableForm.parse(req, function(err, fields, files) {

        console.log(err)
        console.log(fields)
        console.log(files)

        // handle photo file
        if (files.media) {

            var mediaType = files.media.type;
            var mediaPath = files.media.path;

            // if (['image/jpeg', 'image/gif', 'image/png'].indexOf(mediaType) === -1) {
            //     res.status(415).send("Only jpeg, gif or png file are valide");
            //     return;
            // }

            var mediaName = /.*[\/|\\](.*)$/.exec(mediaPath)[1];

            req.session.tempMedia = mediaName;

            res.json({
                src: './upload/' + mediaName,
                type: mediaType
            });

            // gm(mediaPath).size(function(err, size) {
            //     if (err) next(err);
            //     else res.json({fileName: './upload/' + mediaName});
            // });

        } else {
            res.json(400, {});
        }
    });
};