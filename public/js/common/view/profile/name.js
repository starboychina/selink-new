define([
    'common/view/item-base',
    'text!common/template/profile/name.html'
], function(
    BaseView,
    template
) {

    return BaseView.extend({

        // template
        template: template,

        // override placeholder
        placeholder: '氏名',

        // initializer
        initialize: function() {

            this.ui = _.extend({}, this.ui, {
                firstName: 'input[name="firstName"]',
                lastName: 'input[name="lastName"]'
            });

            // Update model when input's value was chenaged
            this.events = _.extend({}, this.events, {
                'change input[name="firstName"]': 'updateModel',
                'change input[name="lastName"]': 'updateModel'
            });

            // listen on nearestSt property for save
            this.modelEvents = {
                'change:firstName': 'save',
                'change:lastName': 'save'
            };
        },

        // after render
        onRender: function() {
            // bind validator
            Backbone.Validation.bind(this);
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

        // get user input data
        getData: function() {
            return {
                firstName: this.ui.firstName.val(),
                lastName: this.ui.lastName.val()
            };
        },

        // render value with user input data
        renderValue: function(data) {

            if (!data.firstName && !data.lastName) {
                this.ui.value.html(this.placeholder);
                return;
            }

            this.ui.value.text(data.firstName + " " + data.lastName);
        }

    });
});