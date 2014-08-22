define([
    'text!common/template/password/main.html',
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
            password: 'input[name="password"]',
            password2: 'input[name="password2"]'
        },

        // events
        events: {
            'click .btn-save': 'onSave'
        },

        // save button clicked
        onSave: function() {

            // clear errors
            this._clearError();

            if (this.ui.password.val().length < 8) {

                // show error
                this._showError({
                    password: 'パースワードは最低8でご設定ください'
                });

            } else if (this.ui.password.val() != this.ui.password2.val()) {

                // show error
                this._showError({
                    password: '二つパースワードが一致していません',
                    password2: '二つパースワードが一致していません'
                });

            } else {

                // save new password
                this.model.save('password', this.ui.password.val(), {

                    success: function() {

                        // hide modal
                        selink.modalArea.$el.modal('hide');

                        // inform user operation success
                        $.gritter.add({
                            title: 'パースワード変更',
                            text: 'パースワードの変更は成功しました',
                            class_name: 'gritter-success'
                        });
                    },
                    silent: true,
                    patch: true,
                    wait: true
                });
            }
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
        },

    });
});