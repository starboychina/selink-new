var mongoose = require('mongoose'),
    Station = require('./station'),
    // validate = require('mongoose-validator').validate,
    Schema = mongoose.Schema;

var Line = new Schema({
    name: {
        type: String,
        trim: true
    },
    kana: {
        type: String,
        trim: true
    },
    pref: {
        type: Number,
    },
    stations: [{
        type: Schema.Types.ObjectId,
        ref: 'Station'
    }],
});

mongoose.model('Line', Line);