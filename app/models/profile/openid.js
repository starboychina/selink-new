var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Openid = new Schema({
    openid: {
        type: String,
        trim: true,
    },
    type: {
        type: String,
        trim: true
    }
});

module.exports = Openid;
