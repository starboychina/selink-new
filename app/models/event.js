var mongoose = require('mongoose');
// var validate = require('mongoose-validator').validate;
var Schema = mongoose.Schema;

var Event = new Schema({

    // Event owner
    _owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Event group
    group: {
        type: Schema.Types.ObjectId,
        ref: 'Group'
    },

    // Event title
    title: {
        type: String,
        trim: true,
        // validate: validate('len', 0, 100)
    },

    // All-day flag
    allDay: {
        type: Boolean,
        default: false
    },

    // Start date time
    start: {
        type: Date
    },

    // End date time
    end: {
        type: Date
    },

    // Class name
    className: {
        type: String,
        trim: true
    },

    // Memo
    memo: {
        type: String,
        trim: true
    },

    // Logic delete flag
    logicDelete: {
        type: Boolean,
        default: false
    },

    // Create date
    createDate: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('Event', Event);