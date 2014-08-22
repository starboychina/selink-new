define([], function() {

    return Backbone.Marionette.ItemView.extend({

        // ui
        ui: {
            sendBtn: '.btn-send',
            errorAlert: '.alert-danger',
            successAlert: '.alert-success'
        },

        // events
        events: {
            'click .btn-send': 'onSend'
        },

        // sign up process
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
                url: '/retrieve/' + this.$el.find('input[name="_id"]').val(),

                // post form data
                data: {
                    password: this.$el.find('input[name="password"]').val()
                },

                // method is post
                type: 'PUT',

                // use json format
                dataType: 'json',

                // timeout in 3 seconds
                timeout: 3000,

                // disable the button and spin an icon
                beforeSend: function() {
                    self.$el.find('.btn-send').button('loading');
                },

                // sign up success handler
                success: function(result) {

                    // show success message
                    self.$el.find('.alert-success').slideDown();
                },

                // sign up error handler
                error: function(xhr, status) {

                    if (xhr.status == '404') {
                        self.$el.find('.alert-danger').slideDown();
                    }
                },

                // reset button status to normal
                complete: function() {
                    // clear user input
                    self.$el.find('input').val('').closest('.input-group').slideUp();
                    self.$el.find('.btn-send').button('reset');
                    self.$el.find('.btn-send').slideUp();
                }
            });
        },

        // check input
        checkInput: function() {

            var errors = {},
                password = this.$el.find('input[name="password"]').val(),
                passwordConf = this.$el.find('input[name="passwordConf"]').val();

            // clear errors
            this._clearError();

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
