var fs = require('fs'),
    pattern = /(.*)?\.js/,
    postController = {};

fs.readdirSync(__dirname).forEach(function (file) {

    console.log(file);

    if (~file.indexOf('.js') && file !== 'main.js') {
        var match = pattern.exec(file);
        postController[match[1]] = require('./' + file);
    }
});

module.exports = postController;