var path = require('path'),
    formidable = require('formidable');

// parse a file upload
module.exports = new formidable.IncomingForm({
    uploadDir: path.join(config.root + '/public/upload')
});