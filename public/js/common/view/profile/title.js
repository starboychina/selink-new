define([
    'common/view/item-base',
    'text!common/template/profile/title.html'
], function(
    BaseView,
    template) {

    return BaseView.extend({

        // template
        template: template,

        // initializer
        initialize: function() {

            this.ui = _.extend({}, this.ui, {
                'input': 'input'
            });

            // update model when input value changed
            this.events = _.extend({}, this.events, {
                'change input': 'updateModel'
            });

            // listen on title property for save
            this.modelEvents = {
                'change:title': 'save'
            };
        },

        // after render
        onRender: function() {

            // bind validator
            Backbone.Validation.bind(this);
        },

        // after show
        onShow: function() {
            this.$el.addClass('animated fadeInLeft');
        },

        // reflect user input on model
        updateModel: function() {

            // clear all errors
            this.clearError();

            // check input value
            var errors = this.model.preValidate(this.getData());

            // if input has errors
            if (errors) {
                // show error
                this.showError(errors);
            } else {
                // set value on model
                this.model.set(this.getData());
            }
        },

        getData: function() {
            return {
                title: this.ui.input.val()
            };
        },

        renderValue: function(data) {

            if (!data.title) {
                this.ui.value.html(this.placeholder);
                return;
            }

            this.ui.value.html('<span>' + data.title + '</span>');
        }

    });
});