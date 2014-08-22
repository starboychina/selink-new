var mongoose = require('mongoose');
// var validate = require('mongoose-validator').validate;
var Schema = mongoose.Schema;

var Employment = new Schema({
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    company: {
        type: String,
        trim: true,
        // validate: validate('len', 0, 100)
    },
    address: {
        type: String,
        trim: true,
        // validate: validate('len', 0, 100)
    },
    position: {
        type: String,
        trim: true,
        // validate: validate('len', 0, 100)
    },
    detail: {
        type: String,
        trim: true,
        // validate: validate('len', 0, 3000)
    }
});

module.exports = Employment;