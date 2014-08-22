var mongoose = require('mongoose');
// var validate = require('mongoose-validator').validate;
var Schema = mongoose.Schema;

var Activity = new Schema({

    // activity owner
    _owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // activity type
    type: {
        type: String,
        trim: true,
        required: true
    },

    // activity target (user)
    targetUser: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    // activity target (post)
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

    // activity target (job)
    targetJob: {
        type: Schema.Types.ObjectId,
        ref: 'Job'
    },

    // activity target (message)
    targetMessage: {
        type: Schema.Types.ObjectId,
        ref: 'Message'
    },

    // activity target (group)
    targetGroup: {
        type: Schema.Types.ObjectId,
        ref: 'Group'
    },

    // activity target (event)
    targetEvent: {
        type: Schema.Types.ObjectId,
        ref: 'Event'
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

mongoose.model('Activity', Activity);