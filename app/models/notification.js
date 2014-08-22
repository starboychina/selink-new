var mongoose = require('mongoose');
// var validate = require('mongoose-validator').validate;
var Schema = mongoose.Schema;

var Notification = new Schema({

    // notification owner
    _owner: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    // notification sender
    _from: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // notification type
    type: {
        type: String,
        trim: true,
        required: true
    },

    // notification target (post)
    targetPost: {
        type: Schema.Types.ObjectId,
        ref: 'Post'
    },

    // notification target (comment)
    targetComment: {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    },

    // notification target (replied comment)
    targetReplyTo: {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    },

    // notification target (job)
    targetJob: {
        type: Schema.Types.ObjectId,
        ref: 'Job'
    },

    // notification target (message)
    targetMessage: {
        type: Schema.Types.ObjectId,
        ref: 'Message'
    },

    // notification target (group)
    targetGroup: {
        type: Schema.Types.ObjectId,
        ref: 'Group'
    },

    // notification confirmed
    confirmed: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    // result of user reaction
    result: {
        type: String,
        trim: true
    },

    // Logical Delete flag
    logicDelete: {
        type: Boolean,
        default: false
    },

    // Create Date
    createDate: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('Notification', Notification);