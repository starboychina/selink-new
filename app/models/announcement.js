var _s = require('underscore.string'),
    mongoose = require('mongoose'),
    // validate = require('mongoose-validator').validate,
    Schema = mongoose.Schema;

var Announcement = new Schema({

    // Announcement owner
    _owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    // Title
    title: {
        type: String,
        trim: true,
    },

    // Content
    content: {
        type: String,
        trim: true,
    },

    // Expired Date
    expiredDate: {
        type: Date
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

Announcement.methods.toSolr = function() {
    return {
        type: 'Announcement',
        id: this.id,
        // owner:
        title: this.title,
        content: _s.stripTags(this.content),
        expiredDate: this.expiredDate,
        logicDelete: this.logicDelete
    };
};

mongoose.model('Announcement', Announcement);