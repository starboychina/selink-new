var mongoose = require('mongoose');
// var validate = require('mongoose-validator').validate;
var Schema = mongoose.Schema;

var Station = new Schema({
    name: {
        type: String,
        trim: true,
        // validate: validate('len', 0, 20)
    },
    kana: {
        type: String,
        trim: true,
    },
    zipcode: {
        type: String,
        trim: true
    },
    pref: {
        type: String,
        trim: true
    },
    pref_name: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    location:{
        type: [Number],
        index: '2d'
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
Station.virtual('lon').get(function () {
    return this.location[1];
});
Station.virtual('lat').get(function () {
    return this.location[0];
});
Station.set('toJSON', { virtuals: true });
Station.set('toObject', { virtuals: true });

mongoose.model('Station', Station);