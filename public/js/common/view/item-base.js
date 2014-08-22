define([], function() {

    return Backbone.Marionette.ItemView.extend({

        // placeholder for empty value
        placeholder: '<span class="text-muted">クリックして編集</span>',

        // common events
        events: {
            // Switch to edit-mode when the div was clicked
            'click': 'openEditor'
        },

        // common ui
        ui: {
            value: '.sl-value',
            editor: '.sl-editor'
        },

        // Switch sl-editor from view-mode to edit-mode
        openEditor: function() {

            var self = this;

            // fadeOut view panel
            this.ui.value.fadeOut('fast', function() {
                // slideDown edit panel
                self.ui.editor.slideDown('fast');
                // mark this editor as opened
                self.$el.addClass('sl-editor-open');
            });
        },

        // update model
        save: function(event) {

            // when model exists
            if(this.model) {

                var self = this,
                    data = this.getData(event);

                // save model
                this.model.save(data, {

                    // success handler
                    success: function(model, response, options) {

                        self.renderValue(data);
                        self.$el.find('.sl-icon').slFlip('green');
                    },

                    // error handler
                    error: function(model, xhr, options) {

                        var error = $.parseJSON(xhr.responseText);

                        $.gritter.add({
                            title: error.title,
                            text: error.msg,
                            sticky: true,
                            class_name: 'gritter-error gritter-center',
                        });
                    },

                    // use patch
                    patch: true

                });
            }
        },

        // show input validation error on the view
        showError: function(errors) {
            for(var key in errors) {
                this.$el.find('input[name="' + key + '"]')
                    .addClass('tooltip-error').tooltip({
                        placement: 'bottom',
                        title: errors[key]
                    })
                    .closest('.form-group').addClass('has-error')
                    .find('i').addClass('animated-input-error');
            }
        },

        // clear input validation error
        clearError: function() {
            this.$el.find('input')
                .removeClass('tooltip-error').tooltip('destroy')
                .closest('.form-group').removeClass('has-error')
                .find('i').removeClass('animated-input-error');
        },

        // subclass should provide these methods

        // get user input data
        getData: function() {},

        // render value by user input data
        renderValue: function(data) {}
    });
});