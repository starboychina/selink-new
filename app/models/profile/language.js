var mongoose = require('mongoose');
// var validate = require('mongoose-validator').validate;
var Schema = mongoose.Schema;

var Language = new Schema({
    language: {
        type: String,
        trim: true,
        // validate: validate('len', 0, 20)
    },
    weight: {
        type: Number,
        min: 0,
        max: 100
    },
    sortIndex: {
        type: Number
    }
});

module.exports = Language;