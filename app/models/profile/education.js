var mongoose = require('mongoose');
// var validate = require('mongoose-validator').validate;
var Schema = mongoose.Schema;

var Education = new Schema({
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    school: {
        type: String,
        trim: true,
        // validate: validate('len', 0, 100)
    },
    major: {
        type: String,
        trim: true,
        // validate: validate('len', 0, 100)
    },
    detail: {
        type: String,
        trim: true,
        // validate: validate('len', 0, 3000)
    }
});

module.exports = Education;