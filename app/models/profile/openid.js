var mongoose = require('mongoose');
// var validate = require('mongoose-validator').validate;
var Schema = mongoose.Schema;

var Openid = new Schema({
    openid: {
        type: String,
        trim: true,
        // validate: validate('len', 0, 20)
    },
    access_token: {
        type: String,
        trim: true
    },
    refresh_token: {
        type: String,
        trim: true
    },
    expirationDate: {
        type: String,
        trim: true
    },
    type: {
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

module.exports = Openid;