define([
    'text!admin/template/announcement/edit.html',
    'common/model/job'
], function(
    template,
    JobModel
) {

    return Backbone.Marionette.ItemView.extend({

        // template
        template: template,

        // this view is a modal dialog
        className: 'modal-dialog announcement-modal',

        ui: {
            'title': 'input[name="title"]',
            'expiredDate': 'input[name="expiredDate"]',
            'expiredTime': 'input[name="expiredTime"]',
            'content': '.wysiwyg-editor'
        },

        events: {
            'click .btn-save': 'onSave'
        },

        // initializer
        initialize: function() {

            if (!this.model) {
                this.model = new JobModel();
            }
        },

        // after render
        onRender: function() {

            // append data picker
            this.ui.expiredDate.datepicker({
                autoclose: true,
                forceParse: false,
                startDate: new Date(),
                todayHighlight: true,
                language: 'ja'
            });

            this.ui.expiredTime.timepicker({
                minuteStep: 5,
                showMeridian: false,
                defaultTime: false
                // defaultTime: moment().format('h:m A')
            });

            // enable wysiwyg editor
            this.ui.content.ace_wysiwyg().prev().addClass('wysiwyg-style3');

        },

        onSave: function() {

            // if input value checking ok
            if (this.inputValid()) {

                var self = this;

                // if this is a new model
                if (this.model.isNew()) {

                    // create the model
                    this.collection.create(this.getInputData(), {
                        // model saved successful
                        success: function(model, response, options) {
                            selink.modalArea.$el.modal('hide');
                        },
                        wait: true
                    });

                } else {

                    // update the model
                    this.model.save(this.getInputData(), {
                        // model saved successful
                        success: function(model, response, options) {
                            selink.modalArea.$el.modal('hide');
                        },
                        silent: true,
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

            var userInput = this.getInputData();

            // check input
            var errors = {};

            if (!userInput.title || _.str.isBlank(userInput.title)) {
                errors.title = "公告のタイトルをご入力ください";
            }

            if (!userInput.expiredDate || !moment(userInput.expiredDate).isValid()) {
                errors.expiredDate = "有効な日付をご入力ください";
            }

            if (!userInput.content || _.str.isBlank(this.ui.content.cleanHtml())) {
                errors.content = "公告の内容をご入力ください";
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

            return {
                title: this.ui.title.val(),
                expiredDate: expiredDate,
                content: this.ui.content.cleanHtml()
            };
        }

    });
});