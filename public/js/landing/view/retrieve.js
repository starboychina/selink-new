define([
    'text!landing/template/retrieve.html',
], function(
    template
) {

    return Backbone.Marionette.ItemView.extend({

        // template
        template: template,

        // this view is a modal dialog
        className: 'modal-dialog',

        // ui
        ui: {
            email: 'input[name="email"]',
            sendBtn: '.btn-send',
            successAlert: '.alert-success',
            errorAlert: '.alert-danger'
        },

        // events
        events: {
            'click .btn-send': 'onSend'
        },

        // send email address for password retrieve
        onSend: function(e) {

            // prevent default action
            e.preventDefault();

            // if validation error exists
            if (!_.isEmpty(this.checkInput()))
                return;

            var self = this;

            // sign-up
            $.ajax({

                // page url
                url: '/retrieve',

                // post form data
                data: {
                    email: this.ui.email.val()
                },

                // method is post
                type: 'POST',

                // use json format
                dataType: 'json',

                // timeout in 3 seconds
                timeout: 3000,

                // disable the button and spin an icon
                beforeSend: function() {
                    self.ui.sendBtn.button('loading');
                },

                // sign up success handler
                success: function(result) {

                    // show success message
                    self.ui.successAlert.slideDown();

                    // clear user input
                    self.ui.email.val('').closest('.form-group').slideUp();
                    self.ui.sendBtn.button('reset');
                    self.ui.sendBtn.slideUp();
                },

                // sign up error handler
                error: function(xhr, status) {

                    if (xhr.status == '404') {
                        self.ui.errorAlert.text("該当メールアドレスで登録したアカウントが存在しませんが、ご入力を確かめてもう一度送信してください。").slideDown(function() {
                            setTimeout(function() {
                                self.ui.errorAlert.empty().slideUp();
                            }, 3000);
                        });
                    } else if (xhr.status == '409') {
                        self.ui.errorAlert.text("該当メールアドレスで登録したアカウントは、パースワード変更の手続きを申請済みです。").slideDown(function() {
                            setTimeout(function() {
                                self.ui.errorAlert.empty().slideUp();
                            }, 3000);
                        });
                    }

                    self.ui.sendBtn.button('reset');
                }

            });
        },

        // check input
        checkInput: function() {

            var errors = {},
                email = this.ui.email.val();

            // clear errors
            this._clearError();

            // check email
            if (_.str.isBlank(email))
                errors.email = "メールアドレスをご入力ください";
            else if (!/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(email))
                errors.email = "メールアドレスのフォーマットでご入力ください";

            // show errors, if any
            this._showError(errors);

            // return errors
            return errors;
        },

        // show input validation error on the view
        _showError: function(errors) {

            for (var key in errors) {

                this.$el.find('input[name="' + key + '"]')
                    .addClass('tooltip-error')
                    .tooltip({
                        placement: 'bottom',
                        title: errors[key]
                    })
                    .closest('.input-group')
                    .addClass('has-error')
                    .find('i')
                    .addClass('animated-input-error');
            }
        },

        // clear input validation error
        _clearError: function() {

            this.$el.find('input')
                .removeClass('tooltip-error')
                .tooltip('destroy')
                .closest('.input-group')
                .removeClass('has-error')
                .find('i')
                .removeClass('animated-input-error');
        }

    });
});