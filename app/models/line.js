var mongoose = require('mongoose'),
    Station = require('./mobile/station'),
    // validate = require('mongoose-validator').validate,
    Schema = mongoose.Schema;

var Line = new Schema({
    name: {
        type: String,
        trim: true
    },
    pref: {
        type: Number,
    },
    stations: [Station],
});

mongoose.model('Line', Line);