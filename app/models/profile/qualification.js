var mongoose = require('mongoose');
// var validate = require('mongoose-validator').validate;
var Schema = mongoose.Schema;

var Qualification = new Schema({
    name: {
        type: String,
        trim: true,
        // validate: validate('len', 0, 100)
    },
    acquireDate: {
        type: Date
    }
});

module.exports = Qualification;