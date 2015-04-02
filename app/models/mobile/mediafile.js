var mongoose = require('mongoose');
// var validate = require('mongoose-validator').validate;
var Schema = mongoose.Schema;

var MediaFile = new Schema({
    name: {
        type: String,
        trim: true,
        // validate: validate('len', 0, 20)
    },
    type: {
        type: String,
        trim: true
    },
    width: {
        type: String,
        trim: true
    },
    height: {
        type: String,
        trim: true
    }
});

module.exports = MediaFile;