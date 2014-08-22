var mongoose = require('mongoose');
// var validate = require('mongoose-validator').validate;
var Schema = mongoose.Schema;

var Skill = new Schema({
    skill: {
        type: String,
        trim: true,
        // validate: validate('len', 0, 50)
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

module.exports = Skill;