var _s = require('underscore.string'),
    mongoose = require('mongoose'),
    // validate = require('mongoose-validator').validate,
    Schema = mongoose.Schema;

var Message = new Schema({

    // message owner (recipient)
    _recipient: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],

    // message sender
    _from: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // message subject
    subject: {
        type: String,
        trim: true,
        required: true
    },

    // message content
    content: {
        type: String,
        trim: true,
        required: true
    },

    // message reference
    reference: {
        type: Schema.Types.ObjectId,
        ref: 'Message',
    },

    // message opened
    opened: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    // People who bookmarked this message
    bookmarked: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    // message group
    group: {
        type: Schema.Types.ObjectId,
        ref: 'Group'
    },
    // Logical Delete flag
    logicDelete: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    // Create Date
    createDate: {
        type: Date,
        default: Date.now
    }
});

Message.methods.toSolr = function() {
    return {
        type: 'Message',
        id: this.id,
        // recipient:
        // from:
        subject: this.subject,
        content: _s.stripTags(this.content),
        // logicDelete is special for message
        // logicDelete: this.logicDelete
    };
};

mongoose.model('Message', Message);