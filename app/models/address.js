var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Address = new Schema({
    zipCode: {
        type: String,
        trim: true,
        unique: true
    },
    stateKana: {
        type: String,
        trim: true
    },
    cityKana: {
        type: String,
        trim: true
    },
    streetKana: {
        type: String,
        trim: true
    },
    state: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    street: {
        type: String,
        trim: true
    }
});

mongoose.model('Address', Address);