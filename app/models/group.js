var _ = require('underscore'),
    _s = require('underscore.string'),
    mongoose = require('mongoose'),
    // validate = require('mongoose-validator').validate,
    Schema = mongoose.Schema;

var Group = new Schema({

    _owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Group type
    type: {
        type: String,
        trim: true
    },

    // Group Name
    name: {
        type: String,
        required: true,
        trim: true,
        // validate: validate('len', 0, 100)
    },

    // Cover
    cover: {
        type: String,
        trim: true
    },

    // Description
    description: {
        type: String,
        trim: true,
        // validate: validate('len', 0, 5000)
    },

    // Group Participants
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    // Invited Participants
    invited: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    // Group applicants
    applicants: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    // Group Posts
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }],

    // Group Events
    events: [{
        type: Schema.Types.ObjectId,
        ref: 'Event'
    }],
    //Station
    station: {
        type: Schema.Types.ObjectId,
        ref: 'Station'
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

// Create cover reference point to s3
Group.virtual('cover_ref').get(function () {
    if (this.cover)
        return _s.join('/', config.s3.host, config.s3.bucket, 'groups', this._id, 'cover', this.cover);
    else
        return _s.join('/', config.s3.host, config.s3.bucket, 'asset/default_cover.jpg');
});

// enable virtual output
Group.set('toJSON', { virtuals: true });
Group.set('toObject', { virtuals: true });

Group.methods.toSolr = function() {
    return {
        type: 'Group',
        id: this.id,
        name: this.name,
        description: this.description,
        logicDelete: this.logicDelete
    };
};

mongoose.model('Group', Group);