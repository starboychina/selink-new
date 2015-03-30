var mongoose = require('mongoose');
// var validate = require('mongoose-validator').validate;
var Schema = mongoose.Schema;

var Device = new Schema({
    name: {
        type: String,
        trim: true,
        // validate: validate('len', 0, 20)
    },
    uuid: {
        type: String,
        trim: true
    },
    token: {
        type: String,
        trim: true
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

module.exports = Device;