define([
    'text!landing/template/signup.html',
    'landing/view/statements'
], function(
    template,
    StatementsView
) {

    return Backbone.Marionette.ItemView.extend({

        // template
        template: template,

        // class Name
        className: 'signup-box widget-box hidden',

        // ui
        ui: {
            firstName: 'input[name="firstName"]',
            lastName: 'input[name="lastName"]',
            email: 'input[name="email"]',
            password: 'input[name="password"]',
            passwordConf: 'input[name="passwordConf"]',
            agreement: 'input[name="agreement"]',
            signUpBtn: '.btn-signup',
            errorAlert: '.alert-danger',
            successAlert: '.alert-success'
        },

        // events
        events: {
            'click .btn-signup': 'onSignUp',
            'click .btn-statements': 'showStatements'
        },

        // sign up process
        onSignUp: function(e) {

            // prevent default action
            e.preventDefault();

            // if validation error exists
            if (!_.isEmpty(this.checkInput()))
                return;

            var self = this;

            // sign-up
            $.ajax({

                // page url
                url: '/signup',

                // post form data
                data: {
                    firstName: this.ui.firstName.val(),
                    lastName: this.ui.lastName.val(),
                    email: this.ui.email.val(),
                    password: this.ui.password.val()
                },

                // method is post
                type: 'POST',

                // use json format
                dataType: 'json',

                // timeout in 3 seconds
                timeout: 3000,

                // disable the button and spin an icon
                beforeSend: function() {
                    self.ui.signUpBtn.button('loading');
                },

                // sign up success handler
                success: function(result) {

                    // show success message
                    self.ui.successAlert.slideDown(function() {
                        // dismiss it after 3 sec
                        setTimeout(function() {
                            self.ui.successAlert.slideUp();
                        }, 3000);
                    });

                    // clear user input
                    self.$el.find('input').val('');
                    self.ui.agreement.prop('checked', false);
                },

                // sign up error handler
                error: function(xhr, status) {

                    if (status == 'timeout') {

                        $.gritter.add({
                            title: '<i class="ace-icon fa fa-wrench icon-animated-wrench bigger-125"></i>&nbsp;&nbsp;サーバが応答しません',
                            text: 'サーバと通信できませんでした、しばらくお待ちいただき、もう一度お試してください。',
                            class_name: 'gritter-error',
                            sticky: false,
                            before_open: function() {
                                if ($('.gritter-item-wrapper').length >= 3) {
                                    return false;
                                }
                            },
                        });

                    } else if (status == 'error') {

                        var error = $.parseJSON(xhr.responseText);

                        self.ui.errorAlert.text(error.msg).slideDown(function() {
                            setTimeout(function() {
                                self.ui.errorAlert.slideUp();
                            }, 3000);
                        });
                    }
                },

                // reset button status to normal
                complete: function() {
                    self.ui.signUpBtn.button('reset');
                }
            });
        },

        // check input
        checkInput: function() {

            var errors = {},
                firstName = this.ui.firstName.val(),
                lastName = this.ui.lastName.val(),
                email = this.ui.email.val(),
                password = this.ui.password.val(),
                passwordConf = this.ui.passwordConf.val();

            // clear errors
            this._clearError();

            // check first name
            if (_.str.isBlank(firstName))
                errors.firstName = "氏名をご入力ください";
            else if (firstName.length > 20)
                errors.firstName = "20文字までご入力ください";

            // check last name
            if (_.str.isBlank(lastName))
                errors.lastName = "氏名をご入力ください";
            else if (lastName.length > 20)
                errors.lastName = "20文字までご入力ください";

            // check email
            if (_.str.isBlank(email))
                errors.email = "メールアドレスをご入力ください";
            else if (!/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(email))
                errors.email = "メールアドレスのフォーマットでご入力ください";

            // check password
            if (_.str.isBlank(password))
                errors.password = "パースワードをご入力ください";
            else if (password.length < 8)
                errors.password = "パースワードは最低8でご設定ください";

            // check passwordConf
            if (_.str.isBlank(passwordConf))
                errors.passwordConf = "パースワードをご入力ください";
            else if (passwordConf != password)
                errors.passwordConf = "二つパースワードが一致していません";

            // check agreement
            if (!this.ui.agreement.is(':checked'))
                errors.agreement = "利用規約は、ぜひご一読ください";

            // show errors, if any
            this._showError(errors);

            // return errors
            return errors;
        },

        // show input validation error on the view
        _showError: function(errors) {

            for (var key in errors) {

                // agreement special treatment
                if (key == "agreement") {

                    this.$el.find('.btn-statements')
                        .addClass('tooltip-error animated-input-error red')
                        .tooltip({
                            placement: 'bottom',
                            title: errors[key]
                        });

                    continue;
                }

                this.$el.find('input[name="' + key + '"]')
                    .addClass('tooltip-error')
                    .tooltip({
                        placement: 'bottom',
                        title: errors[key]
                    })
                    .closest('.form-group')
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
                .closest('.form-group')
                .removeClass('has-error')
                .find('i')
                .removeClass('animated-input-error');

            // agreement special treatment
            this.$el.find('.btn-statements')
                .removeClass('tooltip-error animated-input-error red')
                .tooltip('destroy');
        },

        // show user statsment
        showStatements: function() {
            // create statement view
            var statementsView = new StatementsView();
            // show statement view
            selink.modalArea.show(statementsView);
            selink.modalArea.$el.modal('show');
        }

    });
});
