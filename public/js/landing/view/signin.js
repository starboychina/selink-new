define([
    'text!landing/template/signin.html',
    'landing/view/retrieve'
], function(
    template,
    RetrieveView
){

    return Backbone.Marionette.ItemView.extend({

        // template
        template: template,

        // this view is a form
        // tagName: 'form',

        // class name
        // className: 'navbar-form navbar-right',
        className: 'login-box widget-box no-boder',

        // ui
        ui: {
            email: 'input[name="email"]',
            password: 'input[name="password"]',
            signInBtn: '.btn-signin',
            forgotBtn: '.btn-forgot',
            showBtn: '.btn-show'
        },

        // events
        events: {
            'click .btn-signin': 'onSignIn',
            'click .btn-forgot': 'onForgot',
            'click .btn-show': 'onShowSignUp'
        },

        // sign in process
        onSignIn: function(e) {

            // stop default events
            e.preventDefault();

            // if validation error exists
            if (!_.isEmpty(this.checkInput()))
                return;

            var self = this;

            // sign-in
            $.ajax({

                // page url
                url: '/login',

                // post form data
                data: {
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
                    self.ui.signInBtn.button('loading');
                },

                // login success handler
                success: function(account) {
                    window.location = '/spa';
                },

                // login error handler
                error: function(xhr, status) {

                    if (status == 'timeout') {

                        $.gritter.add({
                            title: '<i class="ace-icon fa fa-wrench icon-animated-wrench bigger-125"></i>&nbsp;&nbsp;サーバが応答しません',
                            text: 'サーバと通信できませんでした、しばらくお待ちいただき、もう一度お試してください。',
                            class_name: 'gritter-error',
                            sticky: false,
                            before_open: function(){
                                if($('.gritter-item-wrapper').length >= 3)
                                    return false;
                            },
                        });

                    } else if (status == 'error') {

                        $.gritter.add({
                            title: "アカウントが存在しません",
                            text: "ユーザIDとパースワードを確かめて、もう一度ご入力ください。",
                            class_name: 'gritter-error',
                            sticky: false,
                            before_open: function(){
                                if($('.gritter-item-wrapper').length >= 3)
                                    return false;
                            },
                        });
                    }
                },

                // reset button status to normal
                complete: function() {
                    self.ui.signInBtn.button('reset');
                }
            });
        },

        // check input
        checkInput: function() {

            var errors = {},
                email = this.ui.email.val(),
                password = this.ui.password.val();

            // clear errors
            this._clearError();

            // check email
            if (_.str.isBlank(email))
                errors.email = "メールアドレスをご入力ください";
            else if (!/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(email))
                errors.email = "メールアドレスのフォーマットでご入力ください";

            // check password
            if (_.str.isBlank(password))
                errors.password = "パースワードをご入力ください";

            // show errors, if any
            this._showError(errors);

            // return errors
            return errors;
        },

        // show input validation error on the view
        _showError: function(errors) {

            for(var key in errors) {

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
                .removeClass('animated-input-error tooltip-error')
                .tooltip('destroy')
                .closest('.form-group')
                .removeClass('has-error');
        },

        // show sign up form
        onShowSignUp: function(e) {

            // stop default event
            e.preventDefault();
            // show signup form
            $('#sign-in-area').addClass('hidden');
            $('#sign-up-area').removeClass('hidden').slFlipInY();
        },

        // show password retrive dialog
        onForgot: function(e) {

            // stop default event
            e.preventDefault();
            // create a password retrieve view
            var retrieveView = new RetrieveView();
            // show password retrieve view
            selink.modalArea.show(retrieveView);
            selink.modalArea.$el.modal('show');
        }

    });
});