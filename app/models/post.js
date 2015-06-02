var _ = require('underscore'),
    _s = require('underscore.string'),
    mongoose = require('mongoose'),
    // validate = require('mongoose-validator').validate,
    Schema = mongoose.Schema;

var Comment = require('./comment'),
    MediaFile = require('./mobile/mediafile');

var Post = new Schema({

    // Post owner
    _owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Post content
    content: {
        type: String,
        trim: true,
    },

    // Post content
    contentText: {
        type: String,
        trim: true,
    },

    // Post images
    images: [{
        type: String,
        trim: true
    }],

    // Post images
    imagesformobile: [MediaFile],

    // Post video
    video: {
        type: String,
        trim: true
    },

    // People who liking this post
    like: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    // People who liked this post
    liked: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    // People who bookmarking this post
    bookmark: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    // People who bookmarked this post
    bookmarked: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    // post group
    group: {
        type: Schema.Types.ObjectId,
        ref: 'Group'
    },

    // Comments
    comments: [Comment],

    // Removed comments
    removedComments: [Comment],

    // AWS transcoder job id
    transcoderJobId: {
        type: String,
        trim: true,
    },

    latitude {
        type: String,
        trim: true,
    },

    longitude {
        type: String,
        trim: true,
    },
    // Setting
    setting: {

        // Publicity of this post
        publicity: {
            type: String,
            trim: true,
            default: 'all'
        },

        commentable: {
            type: Boolean,
            default: true
        }
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

// Create images reference point to s3
Post.virtual('images_ref').get(function () {

    // if the _owner field was populated, it should be an object
    // and the owner's id will be embeded in that object, so we need extract it.
    var userId = this._owner._id ? this._owner._id : this._owner;

    if (this.images && this.images.length)
        return _.map(this.images, function(path) { 
            return _s.join('/', config.s3.host, config.s3.bucket, 'users', userId, 'post', path);
        });
    else
        return [];
});
// Create images reference point to s3
Post.virtual('images_mobile').get(function () {

    // if the _owner field was populated, it should be an object
    // and the owner's id will be embeded in that object, so we need extract it.
    var userId = this._owner._id ? this._owner._id : this._owner;

    if (this.imagesformobile && this.imagesformobile.length)
        return _.map(this.imagesformobile, function(image) { 
            image.name = _s.join('/', config.s3.host, config.s3.bucket, 'users', userId, 'post', image.name);
            return image;
        });
    else
        return [];
});

// Create videp reference point to s3
Post.virtual('video_ref').get(function () {

    var userId = this._owner._id ? this._owner._id : this._owner;

    if (this.video)
        return _s.join('/', config.s3.host, config.s3.bucket, 'users', userId, 'post', this.video);
    else
        return '';
});

// enable virtual output
Post.set('toJSON', { virtuals: true });
Post.set('toObject', { virtuals: true });

Post.methods.toSolr = function() {
    return {
        type: 'Post',
        id: this.id,
        // owner: this._owner.firstName + ' ' + this._owner.lastName,
        // comments: this.comments,
        content: _s.stripTags(this.content),
        logicDelete: this.logicDelete
    };
};

mongoose.model('Post', Post);