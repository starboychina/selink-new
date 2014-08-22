var _ = require('underscore'),
    _s = require('underscore.string'),
    util = require('util'),
    mongoose = require('mongoose'),
    // validate = require('mongoose-validator').validate,
    Schema = mongoose.Schema;

// Sub documents
var Skill = require('./profile/skill');
var Language = require('./profile/language');

var Job = new Schema({

    // Job Owner
    _owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Name
    name: {
        type: String,
        trim: true,
        // validate: validate('len', 0, 100)
    },

    // Expired Date
    expiredDate: {
        type: Date
    },

    // Start Date
    startDate: {
        type: Date
    },

    // End Date
    endDate: {
        type: Date
    },

    // Top Price
    priceTop: {
        type: Number,
        // validate: validate({passIfEmpty: true}, 'isInt')
    },

    // Bottom Price
    priceBottom: {
        type: Number,
        // validate: validate({passIfEmpty: true}, 'isInt')
    },

    // Working Place
    address: {
        type: String,
        trim: true,
        // validate: validate('len', 0, 80)
    },

    // Foreigner allowed flag
    foreignerAllowed: {
        type: Boolean,
        default: true
    },

    // Number of Recruit
    recruitNum: {
        type: Number,
        // validate: validate({passIfEmpty: true}, 'isInt')
    },

    // Number of Interview
    interviewNum: {
        type: Number,
        // validate: validate({passIfEmpty: true}, 'isInt')
    },

    // Language
    languages: [Language],

    // Skill
    skills: [Skill],

    // Remark
    remark: {
        type: String,
        trim: true,
        // validate: validate('len', 0, 5000)
    },

    // Job applicants
    applicants: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    // People who bookmarked this job
    bookmarked: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    match: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    // Publish status
    public: {
        type: Boolean,
        default: true
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

Job.methods.toSolr = function() {

    var languages = _.map(this.languages, function(language) {
        var payload = language.weight/10;
        return language.language + "|" + payload;
    });

    var skills = _.map(this.skills, function(skill) {
        var payload = skill.weight/10;
        return skill.skill + "|" + payload;
    });

    return {
        type: 'Job',
        id: this.id,
        name: this.name,
        expiredDate: this.expiredDate,
        startDate: this.startDate,
        endDate: this.endDate,
        priceTop: this.priceTop,
        priceBottom: this.priceBottom,
        address: this.address,
        foreignerAllowed: this.foreignerAllowed,
        language: languages,
        skill: skills,
        remark: _s.stripTags(this.remark),
        logicDelete: this.logicDelete
    };
};

mongoose.model('Job', Job);