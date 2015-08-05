var _ = require('underscore'),
    _s = require('underscore.string'),
    mongoose = require('mongoose'),
    validate = require('mongoose-validator').validatorjs,
    Schema = mongoose.Schema;

// Sub documents
var Skill = require('./profile/skill'),
    Employment = require('./profile/employment'),
    Education = require('./profile/education'),
    Qualification = require('./profile/qualification'),
    Language = require('./profile/language'),
    Device = require('./profile/device'),
    Openid = require('./profile/openid');

var User = new Schema({

    // Tomo Id
    tomoid: {
        type: String,
        trim: true
    },

    // Primary email
    email: {
        type: String,
        trim: true
    },

    // Password
    password: {
        type: String,
        trim: true
    },

    // User type
    type: {
        type: String,
        trim: true
    },

    // Provider
    provider: {
        type: String,
        trim: true
    },

    // First Name
    firstName: {
        type: String,
        trim: true,
        // validate: validate('len', 0, 20)
    },

    // Last Name
    lastName: {
        type: String,
        trim: true,
        // validate: validate('len', 0, 20)
    },

    nickName: {
      type: String,
      trim: true,
    },

    // Photo
    photo: {
        type: String,
        trim: true
    },

    // Cover
    cover: {
        type: String,
        trim: true
    },

    // Title
    title: {
        type: String,
        trim: true,
        // validate: validate('len', 0, 50)
    },

    // Birth Day
    birthDay: {
        type: Date
    },

    // Gender
    gender: {
        type: String,
        trim: true
    },

    // Nationality
    nationality: {
        type: String,
        trim: true,
        // validate: validate('len', 0, 50)
    },

    // Marriage
    marriage: {
        type: String,
        trim: true
    },

    // Tel No
    telNo: {
        type: String,
        trim: true,
        // validate: validate('len', 0, 20)
    },

    // Personal WebSite
    webSite: {
        type: String,
        trim: true,
        // validate: validate({passIfEmpty: true}, 'isUrl')
    },

    // Zip Code
    zipCode: {
        type: String,
        trim: true,
        // validate: validate('len', 0, 8)
    },

    // Address
    address: {
        type: String,
        trim: true,
        // validate: validate('len', 0, 80)
    },

    // Nearest Station
    nearestSt: {
        type: String,
        trim: true,
        // validate: validate('len', 0, 30)
    },
    
    coordinate:{
        type: [Number],
        index: '2d'
    },

    //mystation
    stations: [{
        type: Schema.Types.ObjectId,
        ref: 'Station'
    }],
    // Self Introduction
    bio: {
        type: String,
        trim: true,
        // validate: validate('len', 0, 5000)
    },

    // Self Introduction
    bioText: {
        type: String,
        trim: true,
        // validate: validate('len', 0, 5000)
    },
    // Language
    languages: [Language],

    // Education
    educations: [Education],

    // Employment
    employments: [Employment],

    // Qualification
    qualifications: [Qualification],

    // Skill
    skills: [Skill],

    // Device
    devices: [Device],

    // Openid
    openids: [Openid],

    // Friends
    friends: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    // Invited Friends
    invited: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    // User Posts
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }],

    // User Participanting Group
    groups: [{
        type: Schema.Types.ObjectId,
        ref: 'Group'
    }],

    // User applying Group
    applying: [{
        type: Schema.Types.ObjectId,
        ref: 'Group'
    }],
    // tag
    tags: [{
        type: Schema.Types.ObjectId,
        ref: 'Tag'
    }],

    // User Setting
    mailSetting: {

        systemNotification: {
            type: Boolean,
            default: true
        },

        friendInvitation: {
            type: Boolean,
            default: true
        },

        invitationAccpected: {
            type: Boolean,
            default: true
        },

        groupInvitation: {
            type: Boolean,
            default: true
        },

        groupJoined: {
            type: Boolean,
            default: true
        },

        groupApplied: {
            type: Boolean,
            default: true
        },

        groupApproved: {
            type: Boolean,
            default: true
        },

        newPost: {
            type: Boolean,
            default: true
        },

        newJob: {
            type: Boolean,
            default: true
        },

        postLiked: {
            type: Boolean,
            default: true
        },

        postBookmarked: {
            type: Boolean,
            default: true
        },

        postCommented: {
            type: Boolean,
            default: true
        },

        commentReplied: {
            type: Boolean,
            default: true
        },

        commentLiked: {
            type: Boolean,
            default: true
        }
    },

    // Last login date
    lastLogin: {
        type: Date
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

// User.methods.toSolrOld = function() {

//     var languages = _.map(this.languages, function(language) {
//         return {
//             id: language._id,
//             language: language.language,
//             weight: language.weight
//         };
//     });

//     var skills = _.map(this.skills, function(skill) {
//         return {
//             id: skill._id,
//             skill: skill.skill,
//             weight: skill.weight
//         };
//     });

//     var educations = _.map(this.educations, function(education) {
//         return {
//             id: education._id,
//             school: education.school,
//             major: education.major
//         };
//     });

//     var employments = _.map(this.employments, function(employment) {
//         return {
//             id: employment._id,
//             company: employment.company,
//             position: employment.position
//         };
//     });

//     var qualifications = _.map(this.qualifications, function(qualification) {
//         return {
//             id: qualification._id,
//             qualification: qualification.name
//         };
//     });

//     return {
//         type: 'user',
//         id: this.id,
//         name: this.firstName + ' ' + this.lastName,
//         email: this.email,
//         title: this.title,
//         birthDay: this.birthDay,
//         gender: this.gender,
//         nationality: this.nationality,
//         marriage: this.marriage,
//         telNo: this.telNo,
//         webSite: this.webSite,
//         address: this.address,
//         nearestSt: this.nearestSt,
//         _childDocuments_: _.union(languages, skills, educations, employments, qualifications),
//         // educations: this.educations,
//         // employments: this.employments,
//         // qualifications: this.qualifications,
//         bio: _s.stripTags(this.bio),
//         logicDelete: this.logicDelete
//     };
// };

// Create photo reference point to s3
User.virtual('photo_ref').get(function () {
    if (this.photo && validate.isURL(this.photo))
        return this.photo;
    if (this.photo)
        return _s.join('/', config.s3.host, config.s3.bucket, 'users', this._id, 'photo', this.photo);
    else
        return _s.join('/', config.s3.host, config.s3.bucket, 'asset/no_photo_male.jpg');
});

// Create cover reference point to s3
User.virtual('cover_ref').get(function () {
    if (this.cover && validate.isURL(this.cover))
        return this.cover;
    if (this.cover)
        return _s.join('/', config.s3.host, config.s3.bucket, 'users', this._id, 'cover', this.cover);
    else
        return _s.join('/', config.s3.host, config.s3.bucket, 'asset/default_cover.jpg');
});

// enable virtual output
User.set('toJSON', { virtuals: true });
User.set('toObject', { virtuals: true });

User.methods.toSolr = function() {

    var languages = _.map(this.languages, function(language) {
        var payload = language.weight/10;
        return language.language + "|" + payload;
    });

    var skills = _.map(this.skills, function(skill) {
        var payload = skill.weight/10;
        return skill.skill + "|" + payload;
    });

    var educations = _.map(this.educations, function(education) {
        return education.school + " " + education.major;
    });

    var employments = _.map(this.employments, function(employment) {
        return employment.company + " " + employment.position;
    });

    var qualifications = _.map(this.qualifications, function(qualification) {
        return qualification.name;
    });

    // var devices = _.map(this.devices, function(device) {
    //     var payload = device.weight;
    //     return device.name + "|" + payload;
    // });

    return {
        type: 'User',
        id: this.id,
        name: this.firstName + ' ' + this.lastName,
        email: this.email,
        title: this.title,
        birthDay: this.birthDay,
        gender: this.gender,
        nationality: this.nationality,
        marriage: this.marriage,
        telNo: this.telNo,
        webSite: this.webSite,
        address: this.address,
        nearestSt: this.nearestSt,
        language: languages,
        // device: devices,
        skill: skills,
        education: educations,
        employment: employments,
        qualification: qualifications,
        bio: _s.stripTags(this.bio),
        logicDelete: this.logicDelete
    };
};

mongoose.model('User', User);
