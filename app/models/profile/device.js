var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Device = new Schema({
    name: {
        type: String,
        trim: true,
    },
    token: {
        type: String,
        trim: true
    }
});

module.exports = Device;
