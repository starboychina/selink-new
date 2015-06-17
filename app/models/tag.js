var _s = require('underscore.string'),
    mongoose = require('mongoose'),
    // validate = require('mongoose-validator').validate,
    Schema = mongoose.Schema;

var Tag = new Schema({
    name: {
        type: String,
        trim: true
    },
    count: {
        type: Number,
    },
    // Tag type
    type: {
        type: String,
        trim: true
    },
    wikis: {
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

Tag.methods.toSolr = function() {
    return {
        type: 'Tag',
        id: this.id,
        // owner:
        name: this.name,
        wikis: _s.stripTags(this.wikis),
        logicDelete: this.logicDelete
    };
};

mongoose.model('Tag', Tag);