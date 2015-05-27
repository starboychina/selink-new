var mongoose = require('mongoose'),
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
    stations: [{
        type: Schema.Types.ObjectId,
        ref: 'Station'
    }],
});

mongoose.model('Line', Line);