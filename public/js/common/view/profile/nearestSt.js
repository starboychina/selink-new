define([
    'common/view/item-base',
    'text!common/template/profile/nearestSt.html'
], function(
    BaseView,
    template
) {

    return BaseView.extend({

        // template
        template: template,

        // className
        className: 'row form-group',

        // initializer
        initialize: function() {

            this.ui = _.extend({}, this.ui, {
                'input': 'input'
            });

            // update model when input value changed
            this.events = _.extend({}, this.events, {
                'change input': 'updateModel'
            });

            // listen on nearestSt property for save
            this.modelEvents = {
                'change:nearestSt': 'save'
            };
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
                nearestSt: this.ui.input.val()
            };
        },

        // render value by user input data
        renderValue: function(data) {
            // if user input is nothing
            if (!data.nearestSt) {
                // draw placehodler
                this.ui.value.html(this.placeholder);
                return;
            }
            // or draw the new value
            this.ui.value.text(data.nearestSt);
        }

    });
});