var mongoose = require('mongoose');
// var validate = require('mongoose-validator').validate;
var Schema = mongoose.Schema;

var TempAccount = new Schema({
    // Email
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        // validate: validate('isEmail')
    },
    // Password
    password: {
        type: String,
        trim: true,
        required: true,
        // validate: validate('len', 8, 30)
    },
    // First Name
    firstName: {
        type: String,
        trim: true,
        // validate: validate('len', 0, 20)
    },
    // Last Name
    lastName: {
        type: String,
        trim: true,
        // validate: validate('len', 0, 20)
    },
    // Account Type
    type: {
        type: String,
        trim: true,
        required: true,
        default: 'engineer'
    },
    // Create Date
    createDate: {
        type: Date,
        default: Date.now,
        expires: 60 * 60
    }
});

mongoose.model('TempAccount', TempAccount);