var mongoose = require('mongoose');
// var validate = require('mongoose-validator').validate;
var Schema = mongoose.Schema;

var ResetPassword = new Schema({
    // Email
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        // validate: validate('isEmail')
    },
    // Create Date
    createDate: {
        type: Date,
        default: Date.now,
        expires: 60 * 60
    }
});

mongoose.model('ResetPassword', ResetPassword);