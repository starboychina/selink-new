define([
    'text!common/template/job/edit.html',
    'common/view/job/edit/languages',
    'common/view/job/edit/skills',
    'common/model/job'
], function(
    template,
    LanguageComposite,
    SkillComposite,
    JobModel
) {

    return Backbone.Marionette.LayoutView.extend({

        // template
        template: template,

        // this view is a modal dialog
        className: 'modal-dialog job-modal',

        // ui
        ui: {
            'name': 'input[name="name"]',
            'address': 'input[name="address"]',
            'expiredDate': 'input[name="expiredDate"]',
            'expiredTime': 'input[name="expiredTime"]',
            'startDate': 'input[name="startDate"]',
            'endDate': 'input[name="endDate"]',
            'priceBottom': 'input[name="priceBottom"]',
            'priceTop': 'input[name="priceTop"]',
            'recruitNum': 'input[name="recruitNum"]',
            'interviewNum': 'input[name="interviewNum"]',
            'foreignerAllowed': 'input[name="foreignerAllowed"]',
            'remark': '.wysiwyg-editor'
        },

        // regions
        regions: {
            languageRegion: '#languages',
            skillRegion: '#skills',
        },

        // events
        events: {
            'click .btn-save': 'onSave'
        },

        // initializer
        initialize: function() {

            // if no model define
            if (!this.model) {
                // create a new model
                this.model = new JobModel();
            }

            // create language area
            this.languageComposite = new LanguageComposite({model: this.model});
            // create skill area
            this.skillComposite = new SkillComposite({model: this.model});
        },

        // after render
        onRender: function() {

            // show language area
            this.languageRegion.show(this.languageComposite);
            // show skill area
            this.skillRegion.show(this.skillComposite);

            // append data picker
            this.ui.expiredDate.datepicker({
                autoclose: true,
                forceParse: false,
                startDate: new Date(),
                todayHighlight: true,
                language: 'ja'
            });

            // append time picker
            this.ui.expiredTime.timepicker({
                minuteStep: 5,
                showMeridian: false,
                defaultTime: false
                // defaultTime: moment().format('h:m A')
            });

            // append duration picker
            this.$el.find('#duration').datepicker({
                autoclose: true,
                forceParse: false,
                startDate: new Date(),
                todayHighlight: true,
                language: 'ja'
            });

            // append input mask
            this.ui.expiredTime.mask('99:99');
            this.ui.priceBottom.mask('9?99');
            this.ui.priceTop.mask('9?99');
            this.ui.recruitNum.mask('9?9');
            this.ui.interviewNum.mask('9?9');

            // enable wysiwyg editor
            this.ui.remark.ace_wysiwyg().prev().addClass('wysiwyg-style3');

            // bind validator
            Backbone.Validation.bind(this);
        },

        onSave: function() {

            // if input value checking ok
            if (this.inputValid()) {

                // if this model is a new job
                if (this.model.isNew()) {
                    // trigger createNewJob event, let main view create the job
                    this.trigger('createNewJob', this.getInputData());
                } else {
                    // // set value to model
                    // this.model.set(this.getInputData());

                    // update the job
                    this.model.save(this.getInputData(), {
                        // job saved successful
                        success: function(model, response, options) {
                            selink.modalArea.$el.modal('hide');
                        },
                        patch: true,
                        wait: true
                    });
                }
            }
        },

        // checking input value
        inputValid: function() {

            // remove all error
            this.$el.find('input')
                .removeClass('tooltip-error').tooltip('destroy')
                .closest('.form-group').removeClass('has-error')
                .find('i').removeClass('animated-input-error');

            var userInput = this.getInputData(),
                startDate,
                endDate,
                expiredDate;

            // check input
            var errors = this.model.preValidate(userInput) || {};

            // check wheter end date is after start date
            if (userInput.startDate && userInput.endDate) {

                // looks very bad, but work
                startDate = new Date(userInput.startDate);
                endDate = new Date(userInput.endDate);

                if (moment(startDate).isAfter(endDate))
                    errors.endDate = "開始日より後の時間をご入力ください";
            }

            if (userInput.endDate && userInput.expiredDate) {

                // looks very bad, but work
                expiredDate = new Date(userInput.expiredDate);
                endDate = new Date(userInput.endDate);

                if (moment(expiredDate).isAfter(endDate))
                    errors.expiredDate = "作業終了日より前の日時をご入力ください";
            }

            if (userInput.expiredDate && moment(userInput.expiredDate).isBefore(moment())) {
                errors.expiredDate = "現在より未来の日時をご入力ください";
            }

            if (userInput.priceBottom && userInput.priceTop && userInput.priceBottom >= userInput.priceTop) {
                errors.priceTop = "単価下限より高い金額をご入力ください";
            }

            // if got input error
            if (!_.isEmpty(errors)) {

                // append error message for every input
                for(var key in errors) {
                    this.$el.find('input[name="' + key + '"]')
                    .addClass('tooltip-error').tooltip({
                        placement: 'bottom',
                        title: errors[key]
                    })
                    .closest('.form-group').addClass('has-error')
                    .find('i').addClass('animated-input-error');
                }

                // return not valid
                return false;

            } else {
                // return valid
                return true;
            }
        },

        getInputData: function() {

            // produce expired　datetime
            var expiredDate = new Date(this.ui.expiredDate.val()),
                expiredTime = this.ui.expiredTime.val() ? this.ui.expiredTime.val().split(':') : ["0","0"];

            expiredDate.setHours(Number(expiredTime[0]));
            expiredDate.setMinutes(Number(expiredTime[1]));

            // produce foreignerAllowed value
            var foreignerAllowed = this.ui.foreignerAllowed.is(':checked');

            // produce languages value
            var languages = _.filter(this.languageRegion.currentView.getInput(), function(language) {
                return language.language && language.weight;
            });

            // produce skills value
            var skills = _.filter(this.skillRegion.currentView.getInput(), function(skill) {
                return skill.skill && skill.weight;
            });

            return {
                name: this.ui.name.val(),
                address: this.ui.address.val(),
                expiredDate: expiredDate,
                startDate: this.ui.startDate.val(),
                endDate: this.ui.endDate.val(),
                priceBottom: this.ui.priceBottom.val().replace('_', ''),
                priceTop: this.ui.priceTop.val().replace('_', ''),
                recruitNum: this.ui.recruitNum.val().replace('_', ''),
                interviewNum: this.ui.interviewNum.val().replace('_', ''),
                foreignerAllowed: foreignerAllowed,
                remark: this.ui.remark.cleanHtml(),
                languages: languages,
                skills: skills
            };
        }

    });
});