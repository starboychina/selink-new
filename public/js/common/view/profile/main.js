define([
    'text!common/template/profile/main.html',
    'common/view/profile/cover',
    'common/view/profile/photo',
    'common/view/profile/name',
    'common/view/profile/birthday',
    'common/view/profile/gender',
    'common/view/profile/marriage',
    'common/view/profile/nationality',
    'common/view/profile/address',
    'common/view/profile/nearestSt',
    'common/view/profile/telno',
    'common/view/profile/website',
    'common/view/profile/bio',
    'common/view/profile/languages',
    'common/view/profile/skills',
    'common/view/profile/qualifications',
    'common/view/profile/educations',
    'common/view/profile/employments',
], function(
    template,
    CoverItem,
    PhotoItem,
    NameItem,
    BirthDayItem,
    GenderItem,
    MarriageItem,
    NationalityItem,
    AddressItem,
    NearestStItem,
    TelNoItem,
    WebSiteItem,
    BioItem,
    LanguageComposite,
    SkillComposite,
    QualificationComposite,
    EducationComposite,
    EmploymentComposite
) {

    // profile view
    return Backbone.Marionette.LayoutView.extend({

        // template
        template: template,

        // regions
        regions: {
            coverRegion: '#cover',
            photoRegion: '#photo',
            nameRegion: '#name',
            birthdayRegion: '#birthday',
            genderRegion: '#gender',
            marriageRegion: '#marriage',
            nationalityRegion: '#nationality',
            addressRegion: '#address',
            nearestStRegion: '#nearestst',
            telNoRegion: '#telno',
            webSiteRegion: '#website',
            bioRegion: '#bio',
            languageRegion: '#languages',
            skillRegion: '#skills',
            qualificationRegion: '#qualifications',
            educationRegion: '#educations',
            employmentRegion: '#employments',
        },

        // initializer
        initialize: function() {
            // create component
            this.coverItem = new CoverItem({model: this.model});
            this.photoItem = new PhotoItem({model: this.model});
            this.nameItem = new NameItem({model: this.model});
            this.birthdayItem = new BirthDayItem({model: this.model});
            this.genderItem = new GenderItem({model: this.model});
            this.marriageItem = new MarriageItem({model: this.model});
            this.nationalityItem = new NationalityItem({model: this.model});
            this.addressItem = new AddressItem({model: this.model});
            this.nearestStItem = new NearestStItem({model: this.model});
            this.telNoItem = new TelNoItem({model: this.model});
            this.webSiteItem = new WebSiteItem({model: this.model});
            this.bioItem = new BioItem({model: this.model});
            this.languageComposite = new LanguageComposite({model: this.model});
            this.skillComposite = new SkillComposite({model: this.model});
            this.qualificationComposite = new QualificationComposite({model: this.model});
            this.educationComposite = new EducationComposite({model: this.model});
            this.employmentComposite = new EmploymentComposite({model: this.model});
        },

        // after render
        onRender: function() {
            // show every component
            this.coverRegion.show(this.coverItem);
            this.photoRegion.show(this.photoItem);
            this.nameRegion.show(this.nameItem);
            this.birthdayRegion.show(this.birthdayItem);
            this.genderRegion.show(this.genderItem);
            this.marriageRegion.show(this.marriageItem);
            this.nationalityRegion.show(this.nationalityItem);
            this.addressRegion.show(this.addressItem);
            this.nearestStRegion.show(this.nearestStItem);
            this.telNoRegion.show(this.telNoItem);
            this.webSiteRegion.show(this.webSiteItem);
            this.bioRegion.show(this.bioItem);
            this.languageRegion.show(this.languageComposite);
            this.skillRegion.show(this.skillComposite);
            this.qualificationRegion.show(this.qualificationComposite);
            this.educationRegion.show(this.educationComposite);
            this.employmentRegion.show(this.employmentComposite);

            Backbone.Validation.bind(this);
        },

        // after show
        onShow: function() {
            this.$el.addClass('animated fadeIn');
        }
    });
});