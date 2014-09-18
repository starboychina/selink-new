define([
    'common/model/base',
    'common/collection/base',
    'common/model/language',
    'common/model/skill',
    'common/model/qualification',
    'common/model/education',
    'common/model/employment',
], function(
    BaseModel,
    BaseCollection,
    LanguageModel,
    SkillModel,
    QualificationModel,
    EducationModel,
    EmploymentModel
) {

    // Languages Collection
    var Languages = BaseCollection.extend({

        model: LanguageModel,

        url: function() {
            return this.document.url() + '/languages';
        },

        comparator: function(language) {
            // sort by weight desc
            if (language.get('weight'))
                return 0 - Number(language.get('weight'));
            else
                return 0;
        }
    });

    // Skills Collection
    var Skills = BaseCollection.extend({

        model: SkillModel,

        url:  function() {
            return this.document.url() + '/skills';
        },

        comparator: function(skill) {
            // sort by weight desc
            if (skill.get('weight'))
                return 0 - Number(skill.get('weight'));
            else
                return 0;
        }
    });

    // Qualifications Collection
    var Qualifications = BaseCollection.extend({

        model: QualificationModel,

        url:  function() {
            return this.document.url() + '/qualifications';
        },

        comparator: function(qualification) {
            // sort by acquireDate desc
            if (qualification.get('acquireDate')) {
                var date = moment(qualification.get('acquireDate'));
                return 0 - Number(date.valueOf());
            }
            else
                return 0;
        }
    });

    // Educations Collection
    var Educations = BaseCollection.extend({

        model: EducationModel,

        url:  function() {
            return this.document.url() + '/educations';
        },

        comparator: function(education) {
            // sort by startDate desc
            if (education.get('startDate')) {
                var date = moment(education.get('startDate'));
                return 0 - Number(date.valueOf());
            }
            else
                return 0;
        }
    });

    // Employments Collection
    var Employments = BaseCollection.extend({

        model: EmploymentModel,

        url:  function() {
            return this.document.url() + '/employments';
        },

        comparator: function(employment) {
            // sort by startDate desc
            if (employment.get('startDate')) {
                var date = moment(employment.get('startDate'));
                return 0 - Number(date.valueOf());
            }
            else
                return 0;
        }
    });

    // User Model
    return BaseModel.extend({

        // Url root
        urlRoot: '/users',

        // Constructor
        constructor: function() {

            // create languages collection inside model
            this.languages = new Languages(null, {document: this});

            // create skills collection inside model
            this.skills = new Skills(null, {document: this});

            // create qualifications collection inside model
            this.qualifications = new Qualifications(null, {document: this});

            // create educations collection inside model
            this.educations = new Educations(null, {document: this});

            // create employments collection inside model
            this.employments = new Employments(null, {document: this});

            // call super constructor
            Backbone.Model.apply(this, arguments);
        },

        // Parse data
        parse: function(response, options) {

            // populate languages collection
            this.languages.set(response.languages, {parse: true, remove: false});

            // populate skills collection
            this.skills.set(response.skills, {parse: true, remove: false});

            // populate qualifications collection
            this.qualifications.set(response.qualifications, {parse: true, remove: false});

            // populate educations collection
            this.educations.set(response.educations, {parse: true, remove: false});

            // set final education
            if (response.educations && response.educations.length)
                response.finalEducation = _.max(response.educations, function(education) {
                    return education.startDate ? moment(education.startDate).valueOf() : 0;
                });

            // populate employments collection
            this.employments.set(response.employments, {parse: true, remove: false});

            // set current employment
            if (response.employments && response.employments.length)
                response.currentEmployment = _.max(response.employments, function(employment) {
                    return employment.startDate ? moment(employment.startDate).valueOf() : 0;
                });

            // Don't delete these attribute, for the conveience of "people/item.html" template render.
            // delete response.languages;
            // delete response.skills;
            // delete response.qualifications;
            // delete response.educations;
            // delete response.employments;

            // parse birth day from iso-date to readable format
            if(response.birthDay) {
                response.birthDayDisplay = moment(response.birthDay).format('LL');
                response.birthDayInput = moment(response.birthDay).format('L');
            }

            return response;
        },

        // Validator
        validation: {
            firstName: [{
                required: true,
                msg: "氏名をご入力ください"
            },{
                maxLength: 20,
                msg: "最大20文字までご入力ください"
            }],
            lastName: {
                maxLength: 20,
                msg: "最大20文字までご入力ください"
            },
            title: {
                maxLength: 20,
                msg: "最大20文字までご入力ください"
            },
            birthDay: {
                required: false,
                dateJa: true
            },
            address: {
                required: false,
                maxLength: 80,
                msg: "最大80文字までご入力ください"
            },
            nearestSt: {
                required: false,
                maxLength: 30,
                msg: "最大30文字までご入力ください"
            },
            secEmail: {
                required: false,
                pattern: 'email',
                msg: "正しいフォーマットでご入力ください"
            },
            webSite: {
                required: false,
                pattern: 'url',
                msg: "正しいURLフォーマットでご入力ください"
            }
        },

        // Profile Completeness
        completeness: function() {

            var completeness = 0;

            if (this.get('photo'))
                completeness += 10;

            if (this.get('firstName'))
                completeness += 5;

            if (this.get('lastName'))
                completeness += 5;

            if (this.get('birthDay'))
                completeness += 5;

            if (this.get('gender'))
                completeness += 5;

            if (this.get('nationality'))
                completeness += 5;

            if (this.get('marriage'))
                completeness += 5;

            if (this.get('telNo'))
                completeness += 10;

            if (this.get('webSite'))
                completeness += 5;

            if (this.get('nearestSt'))
                completeness += 5;

            if (this.get('address'))
                completeness += 5;

            if (this.get('bio'))
                completeness += 10;

            if (this.qualifications.length)
                completeness += 5;

            if (this.languages.length)
                completeness += 5;

            if (this.skills.length)
                completeness += 5;

            if (this.educations.length)
                completeness += 5;

            if (this.employments.length)
                completeness += 5;

            return completeness;
        }
    });
});